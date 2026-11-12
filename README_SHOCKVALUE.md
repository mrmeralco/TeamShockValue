# Shockvalue Laravel conversion

The original dashboard is now served as a Blade view at `/`. Its CSS and JavaScript are in `public/`, and account operations use Laravel routes and an Eloquent `User` model.

## Herd setup

From this project directory:

```bash
php artisan migrate
```

Then add the project to Laravel Herd and open its `.test` URL. The default `.env` uses SQLite at `database/database.sqlite`.

The dashboard account actions are backed by:

- `app/Http/Controllers/AuthController.php`
- `app/Models/User.php`
- `routes/web.php`
- Laravel's default users migration, extended with `user_id`

The old `TeamShockValue-main` folder remains unchanged as a fallback.
