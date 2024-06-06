import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Item from "App/Models/Item";

export default class FavoriteController {
  public async files({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
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
      .andWhere("user_id", auth.user.id)
      .andWhere("is_favorite", true)
      .orderBy("created_at", payload.sort)
      .paginate(payload.page, payload.limit);

    return response.send({ errors: null, items });
  }

  public async toggle({ auth, request, response }: HttpContextContract) {
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

    item.is_favorite = !item.is_favorite;
    await item.save();

    return response.send({ errors: null, item });
  }
}
