# Shockvalue Laravel conversion

This is a short Laravel-specific supplement. The full product concept, IoT architecture, innovation boundaries, blockchain guidance, setup instructions, and roadmap are documented in [README.md](README.md).

## Laravel setup

From the project directory:

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Open `http://127.0.0.1:8000`, or add the project to Laravel Herd and use its generated `.test` URL.

The dashboard is served at `/dashboard` after authentication. The root route sends unauthenticated visitors to `/login` and authenticated users to the dashboard.

## Account-backed features

- `app/Http/Controllers/AuthController.php` handles signup, login, sessions, profile updates, email changes, password changes, and logout.
- `app/Models/User.php` defines the Eloquent user model.
- `routes/web.php` defines the web and account API routes.
- Laravel's users migration is extended with the prototype `user_id` field.

## IoT boundary

The current dashboard simulates connected-device readings in the browser. It does not yet connect to an ESP32/ESP8266, MQTT broker, utility meter, or blockchain network. Those integrations are intentionally described as future, security-reviewed extensions in the main README.