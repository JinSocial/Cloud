import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Database from "@ioc:Adonis/Lucid/Database";
import Item from "App/Models/Item";
import User from "App/Models/User";
import fs from "fs";

export default class AdminController {
  public async files({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      user: schema.number.optional(),
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

    if (!payload.user) {
      const items = await Item.query()
        .where("is_folder", false)
        .andWhereRaw(
          `name like '%${payload.search?.trim().toLowerCase() || ""}%'`
        )
        .orderBy("created_at", payload.sort)
        .paginate(payload.page, payload.limit);

      return response.send({ errors: null, items });
    }

    const items = await Item.query()
      .where("is_folder", false)
      .where("user_id", payload.user)
      .andWhereRaw(
        `name like '%${payload.search?.trim().toLowerCase() || ""}%'`
      )
      .orderBy("created_at", payload.sort)
      .paginate(payload.page, payload.limit);

    return response.send({ errors: null, items });
  }

  public async users({ response }: HttpContextContract) {
    const users = await User.query().orderBy("created_at", "desc");

    return response.send({ errors: null, users });
  }

  public async delete_user({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      user: schema.number(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    const user = await User.find(payload.user);
    if (!user) {
      return response.notFound({
        errors: [{ message: "Пользователь не найден" }],
      });
    }

    await Item.query().where("user_id", user.id).delete();

    await user.delete();

    return response.send({ errors: null });
  }

  public async edit_user({ request, auth, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      user: schema.number(),
      full_name: schema.string(),
      email: schema.string([rules.email()]),
      new_password: schema.string.optional(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "{{ field }} is required.",
      },
    });

    const user = await User.find(payload.user);
    if (!user) {
      return response.notFound({
        errors: [{ message: "Пользователь не найден" }],
      });
    }

    if (payload.email.toLowerCase() !== user.email) {
      const user = await User.findBy("email", payload.email.toLowerCase());
      if (user) {
        return response.forbidden({
          errors: [{ message: "Email занят" }],
        });
      }
    }

    user.full_name = payload.full_name;
    user.email = payload.email.toLowerCase();
    if (payload.new_password) {
      user.password = payload.new_password;

      await Database.query()
        .from("api_tokens")
        .where("user_id", user.id)
        .delete("");
    }
    await user.save();

    return response.send({ errors: null });
  }

  public async delete_file({ request, response }: HttpContextContract) {
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
    if (!item) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }
    const clearFolder = async (id: number) => {
      const files = await Item.query().where("folder_id", id);
      for (const file of files) {
        if (file.is_folder) {
          await clearFolder(file.id);
        }
        if (file.file) {
          await fs.promises.rm(Application.publicPath(file.file));
        }
        await file.delete();
      }
    };
    if (item.is_folder) {
      await clearFolder(item.id);
    }

    if (item.file) {
      await fs.promises.rm(Application.publicPath(item.file));
    }

    await item.delete();

    return response.send({ errors: null });
  }
}
