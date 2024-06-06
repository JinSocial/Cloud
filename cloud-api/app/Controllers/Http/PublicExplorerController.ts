import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Item from "App/Models/Item";

export default class PublicExplorerController {
  public async files({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      search: schema.string.optional(),
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

    const items = await Item.query()
      .where("is_folder", false)
      .andWhere("is_public", true)
      .andWhereRaw(
        `name like '%${payload.search?.trim().toLowerCase() || ""}%'`
      )
      .orderBy("created_at", payload.sort)
      .paginate(payload.page, payload.limit);

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
