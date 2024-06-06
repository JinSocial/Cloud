import Application from "@ioc:Adonis/Core/Application";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Item from "App/Models/Item";
import { md5 } from "App/Utils/Crypto";
import { generatePassword } from "App/Utils/Random";
import fs from "fs";

export default class ExplorerController {
  public async files({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      search: schema.string.optional(),
      folder_id: schema.number.optional(),
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
    let folder: Item | null = null;
    if (payload.folder_id) {
      folder = await Item.find(payload.folder_id);
      if (!folder || folder.user_id !== auth.user.id || !folder.is_folder) {
        return response.notFound({ errors: [{ message: "Папка не найдена" }] });
      }
    }

    let items: Item[] = [];
    if (folder) {
      items = await Item.query()
        .where("folder_id", folder.id)
        .andWhere("user_id", auth.user.id)
        .andWhereRaw(
          `name like '%${payload.search?.trim().toLowerCase() || ""}%'`
        )
        .orderBy("created_at", payload.sort)
        .paginate(payload.page, payload.limit);
    } else {
      items = await Item.query()
        .whereNull("folder_id")
        .andWhere("user_id", auth.user.id)
        .andWhereRaw(
          `name like '%${payload.search?.trim().toLowerCase() || ""}%'`
        )
        .orderBy("created_at", payload.sort)
        .paginate(payload.page, payload.limit);
    }

    return response.send({ errors: null, items, folder });
  }

  public async get_file({ auth, request, response }: HttpContextContract) {
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
    if (!item || item.user_id !== auth.user.id) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }

    return response.send({ errors: null, item });
  }

  public async create_folder({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      name: schema.string(),
      is_public: schema.boolean(),
      folder_id: schema.number.optional(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    let folder: Item | null = null;
    if (payload.folder_id) {
      folder = await Item.find(payload.folder_id);
      if (!folder || folder.user_id !== auth.user.id || !folder.is_folder) {
        return response.notFound({ errors: [{ message: "Папка не найдена" }] });
      }
    }

    let items: Item[] = [];
    if (folder) {
      items = await Item.query()
        .where("folder_id", folder.id)
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", true)
        .andWhereRaw(`name like '${payload.name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    } else {
      items = await Item.query()
        .whereNull("folder_id")
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", true)
        .andWhereRaw(`name like '${payload.name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    }
    if (items.length !== 0) {
      return response.forbidden({
        errors: [{ message: "Папка с таким именем уже существует" }],
      });
    }

    const item = await Item.create({
      user_id: auth.user.id,
      is_folder: true,
      is_public: payload.is_public,
      name: payload.name,
      folder_id: folder?.id || null,
    });

    await item.refresh();

    return response.send({ errors: null, item });
  }

  public async upload_file({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      file: schema.file({
        size: "100mb",
      }),
      folder_id: schema.number.optional(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    let folder: Item | null = null;
    if (payload.folder_id) {
      folder = await Item.find(payload.folder_id);
      if (!folder || folder.user_id !== auth.user.id || !folder.is_folder) {
        return response.notFound({ errors: [{ message: "Папка не найдена" }] });
      }
    }

    let items: Item[] = [];
    let name = payload.file.clientName;
    if (folder) {
      items = await Item.query()
        .where("folder_id", folder.id)
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", false)
        .andWhereRaw(`name like '${name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    } else {
      items = await Item.query()
        .whereNull("folder_id")
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", false)
        .andWhereRaw(`name like '${name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    }
    if (items.length !== 0) {
      return response.forbidden({
        errors: [{ message: "Файл с таким именем уже существует" }],
      });
    }

    const item = await Item.create({
      user_id: auth.user.id,
      is_folder: false,
      is_public: false,
      name: name,
      folder_id: folder?.id || null,
    });

    const hash = md5(
      `${item.id}.${
        auth.user.id
      }.${new Date().toISOString()}.${generatePassword(6)}`
    );

    await payload.file.move(Application.publicPath(`/files/${hash}`), {
      name: name,
    });

    item.file = `/files/${hash}/${name}`;
    await item.save();
    await item.refresh();

    return response.send({ errors: null, item });
  }

  public async rename_item({ auth, request, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      item_id: schema.number(),
      new_name: schema.string(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    const item = await Item.find(payload.item_id);
    if (!item || item.user_id !== auth.user.id) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }

    let folder: Item | null = null;
    if (item.folder_id) {
      folder = await Item.find(item.folder_id);
      if (!folder || !folder.is_folder) {
        return response.notFound({ errors: [{ message: "Папка не найдена" }] });
      }
    }

    let items: Item[] = [];
    if (folder) {
      items = await Item.query()
        .where("folder_id", folder.id)
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", item.is_folder)
        .andWhereRaw(`name like '${payload.new_name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    } else {
      items = await Item.query()
        .whereNull("folder_id")
        .andWhere("user_id", auth.user.id)
        .andWhere("is_folder", item.is_folder)
        .andWhereRaw(`name like '${payload.new_name.trim().toLowerCase()}'`)
        .orderBy("created_at", "desc");
    }
    if (items.length !== 0) {
      return response.forbidden({
        errors: [{ message: "Файл с таким именем уже существует" }],
      });
    }

    item.name = payload.new_name;
    await item.save();

    return response.send({ errors: null });
  }

  public async delete_item({ auth, request, response }: HttpContextContract) {
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
    if (!item || item.user_id !== auth.user.id) {
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

  public async move_to_folder({
    auth,
    request,
    response,
  }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      item_id: schema.number(),
      folder_id: schema.number.optional(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    const item = await Item.find(payload.item_id);
    if (!item || item.user_id !== auth.user.id) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }
    let folder: Item | null = null;
    if (payload.folder_id) {
      folder = await Item.find(payload.folder_id);
      if (!folder || folder.user_id !== auth.user.id || !folder.is_folder) {
        return response.notFound({ errors: [{ message: "Папка не найдена" }] });
      }
    }

    if (folder) {
      if (folder.id === item.id) {
        return response.badRequest({
          errors: [{ message: "Вы не можете переместить файл сюда" }],
        });
      }

      const getSubFolders = async (folder: Item) => {
        let sub_folders: number[] = [];
        if (folder.folder_id) {
          const item = await Item.find(folder.folder_id);
          if (item) {
            sub_folders.push(item.id);
            sub_folders = [...sub_folders, ...(await getSubFolders(item))];
          }
        }

        return sub_folders;
      };

      if ((await getSubFolders(folder)).includes(item.id)) {
        return response.badRequest({
          errors: [{ message: "Вы не можете переместить файл сюда" }],
        });
      }
    }

    item.folder_id = folder ? folder.id : null;
    await item.save();

    return response.send({ errors: null });
  }

  public async get_folders({ auth, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const folders = await Item.query()
      .where("is_folder", true)
      .andWhere("user_id", auth.user.id);
    const formattedFolders: {
      id: number;
      name: string;
      sub_folders: number[];
    }[] = [];

    const getName = (item: Item) => {
      let name = `/${item.name}`;
      let subFolders: number[] = [];
      if (item.folder_id) {
        const folder = folders.find((e) => e.id === item.folder_id);
        subFolders.push(item.folder_id);
        if (folder) {
          const data = getName(folder);
          name = data.name + name;
          subFolders = [...subFolders, ...data.subFolders];
        }
      }
      return { name, subFolders };
    };

    for (const folder of folders) {
      const data = getName(folder);
      formattedFolders.push({
        id: folder.id,
        name: data.name,
        sub_folders: data.subFolders,
      });
    }

    return response.send({ errors: null, folders: formattedFolders });
  }

  public async share({ request, auth, response }: HttpContextContract) {
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

    if (item.public_hash) {
      return response.send({ errors: null, hash: item.public_hash });
    }
    const hash = md5(
      `${auth.user.id}.${item.id}.${new Date().toISOString()}.public`
    );
    item.public_hash = hash;
    await item.save();

    return response.send({ errors: null, hash: item.public_hash });
  }

  public async unshare({ request, auth, response }: HttpContextContract) {
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
    if (!item.public_hash) {
      return response.badRequest({
        errors: [{ message: "Вы не делитесь этим файлом" }],
      });
    }

    item.public_hash = null;
    await item.save();

    return response.send({ errors: null });
  }

  public async get_shared({ request, response }: HttpContextContract) {
    const requestSchema = schema.create({
      hash: schema.string(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
      },
    });

    const item = await Item.findBy("public_hash", payload.hash);
    if (!item) {
      return response.notFound({ errors: [{ message: "Файл не найден" }] });
    }

    return response.send({ errors: null, item });
  }
}
