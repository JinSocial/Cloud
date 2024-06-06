/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/login", "AuthController.login");
  Route.post("/register", "AuthController.register");
  Route.get("/profile", "AuthController.profile").middleware("auth");

  Route.post("/edit_profile", "AuthController.edit_profile").middleware("auth");
  Route.post("/change_password", "AuthController.change_password").middleware(
    "auth"
  );
}).prefix("auth");

Route.group(() => {
  Route.get("/files", "ExplorerController.files");
  Route.get("/folders", "ExplorerController.get_folders");
  Route.get("/file", "ExplorerController.get_file");
  Route.post("/create_folder", "ExplorerController.create_folder");
  Route.post("/upload_file", "ExplorerController.upload_file");
  Route.post("/move", "ExplorerController.move_to_folder");

  Route.post("/rename", "ExplorerController.rename_item");
  Route.post("/delete", "ExplorerController.delete_item");

  Route.post("/share", "ExplorerController.share");
  Route.post("/unshare", "ExplorerController.unshare");

  Route.group(() => {
    Route.get("/", "FavoriteController.files");
    Route.post("/toggle", "FavoriteController.toggle");
  }).prefix("favorite");
})
  .prefix("explorer")
  .middleware("auth");

Route.group(() => {
  Route.get("/files", "PublicExplorerController.files");

  Route.post("/toggle", "PublicExplorerController.toggle_public");
})
  .prefix("/public/explorer")
  .middleware("auth");

Route.get("/shared/get", "ExplorerController.get_shared");

Route.group(() => {
  Route.get("/files", "AdminController.files");
  Route.get("/users", "AdminController.users");
  Route.get("/delete", "AdminController.users");

  Route.post("/edit_user", "AdminController.edit_user");
  Route.post("/delete_user", "AdminController.delete_user");
})
  .prefix("admin")
  .middleware("auth")
  .middleware("admin");

Route.get("*", async ({ response }) => {
  return response.notFound({ errors: [{ message: "Метод не найден" }] });
});
