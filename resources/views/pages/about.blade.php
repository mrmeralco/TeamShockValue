@extends('layouts.app')
@section('content')
<div class="page-head"><p class="eyebrow">About the project</p><h1>Laravel POS with Eloquent</h1></div><article class="about"><h2>Purpose</h2><p>This project rebuilds a basic point-of-sale interface using Laravel's MVC pattern. It separates page requests, controller logic, database models, and visual templates so the application stays organized as it grows.</p><h2>What it demonstrates</h2><p>The application includes migrations, a seeder, Eloquent customer and user models, dedicated account controllers, reusable Blade layout navigation, and <code>@@foreach</code> loops for database-backed account lists.</p></article>
@endsection
