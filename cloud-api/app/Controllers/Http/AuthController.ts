import Env from "@ioc:Adonis/Core/Env";
import Hash from "@ioc:Adonis/Core/Hash";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

export default class AuthController {
  public async profile({ auth, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }

    return response.send({ errors: null, profile: auth.user });
  }

  public async login({ request, auth, response }: HttpContextContract) {
    const requestSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "Поле {{ field }} обязательное.",
        "email.unique": "Email занят",
      },
    });

    const user = await User.findBy("email", payload.email.toLowerCase());

    if (!user || !(await Hash.verify(user.password, payload.password))) {
      return response.forbidden({
        errors: [{ message: "Неправильный логин или пароль." }],
      });
    }

    try {
      const token = await auth.use("api").generate(user, {
        expiresIn:
          Env.get("NODE_ENV") !== "development" ? "60 mins" : undefined,
      });

      return response.send({ errors: null, token: token.token });
    } catch (error) {
      return response.forbidden({
        errors: [{ message: "Неправильный логин или пароль." }],
      });
    }
  }

  public async register({ request, auth, response }: HttpContextContract) {
    const requestSchema = schema.create({
      full_name: schema.string(),
      email: schema.string([
        rules.email(),
        rules.unique({
          table: "users",
          column: "email",
          caseInsensitive: true,
        }),
      ]),
      password: schema.string(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "{{ field }} is required.",
      },
    });

    const user = await User.create({
      full_name: payload.full_name,
      email: payload.email.toLowerCase(),
      password: payload.password,
    });

    const token = await auth.use("api").generate(user, {
      expiresIn: Env.get("NODE_ENV") !== "development" ? "60 mins" : undefined,
    });

    return response.send({ errors: null, token: token.token });
  }

  public async edit_profile({ request, auth, response }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      full_name: schema.string(),
      email: schema.string([rules.email()]),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "{{ field }} is required.",
      },
    });

    if (payload.email.toLowerCase() !== auth.user.email) {
      const user = await User.findBy("email", payload.email.toLowerCase());
      if (user) {
        return response.forbidden({
          errors: [{ message: "Email занят" }],
        });
      }
    }

    auth.user.full_name = payload.full_name;
    auth.user.email = payload.email.toLowerCase();
    await auth.user.save();

    return response.send({ errors: null });
  }

  public async change_password({
    request,
    auth,
    response,
  }: HttpContextContract) {
    if (!auth.user) {
      return;
    }
    const requestSchema = schema.create({
      old_password: schema.string(),
      new_password: schema.string(),
    });

    const payload = await request.validate({
      schema: requestSchema,
      messages: {
        required: "{{ field }} is required.",
      },
    });

    if (!(await Hash.verify(auth.user.password, payload.old_password))) {
      return response.unauthorized({
        errors: [{ message: "Incorrect password" }],
      });
    }

    auth.user.password = payload.new_password;
    await auth.user.save();

    await Database.query()
      .from("api_tokens")
      .where("user_id", auth.user.id)
      .delete("");

    const token = await auth.use("api").generate(auth.user, {
      expiresIn: "60 mins",
    });

    return response.send({ errors: null, token: token.token });
  }
}
