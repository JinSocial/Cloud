import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Database from "@ioc:Adonis/Lucid/Database";
import Item from "App/Models/Item";

export default class PublicExplorerController {
  public async files({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      search: schema.string.optional(),
      contentSearch: schema.boolean.optional(),
      limit: schema.number([rules.range(1, 100)]),
      page: schema.number(),
      sort: schema.enum(["desc", "asc"] as const),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    let query = Item.query()
      .where("is_folder", false)
      .andWhere("is_public", true);

    const tsquery: string = `websearch_to_tsquery('russian', '${payload.search}')`;
    if (payload.contentSearch && payload.search != null) {
      query = query.andWhereRaw(`to_tsvector('russian', text) @@ ${tsquery}`);
    } else {
      query = query.andWhereRaw(`name like '%${payload.search?.trim().toLowerCase() || ""}%'`);
    }

    const items = await query
      .orderBy("created_at", payload.sort)
      .paginate(payload.page, payload.limit);

    if (payload.contentSearch && payload.search != null) {
      let headlinesResult = await Database.rawQuery(`select ts_headline('russian', text, ${tsquery}) from items where is_folder = false and is_public = true
        and to_tsvector('russian', text) @@ ${tsquery} order by created_at ${payload.sort} offset ${(payload.page-1)*payload.limit} limit ${payload.limit}`);
      let headlines: string[] = headlinesResult.rows.map(e => e["ts_headline"].replace(/\n/g, ''));
      headlines.forEach((h, i) => items[i].headline = h);
    }

    return response.send({ errors: null, items });
  }

  public async toggle_public({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      item_id: schema.number(),
    });
    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    const item = await Item.find(payload.item_id);
    if (!item || item.user_id !== auth.user.id || item.is_folder) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }

    item.is_public = !item.is_public;
    await item.save();

    return response.send({ errors: null, item });
  }
}
