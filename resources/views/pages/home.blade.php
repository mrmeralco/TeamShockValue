@extends('layouts.app')
@section('content')
<section class="hero"><p class="eyebrow">Point of sale foundation</p><h1>Keep everyday POS work clear and organized.</h1><p class="lead">Campus POS is a Laravel application that demonstrates routes, controllers, Blade views, migrations, seeders, and Eloquent database records.</p><a class="button" href="{{ route('customers.index') }}">View customers</a><a class="button secondary" href="{{ route('users.index') }}">View users</a></section>
<section class="grid"><article class="card"><h2>Four connected pages</h2><p>Use the navigation to move between the landing, about, customer, and user account pages.</p></article><article class="card"><h2>MVC structure</h2><p>Routes direct requests to focused controllers that return readable Blade templates.</p></article><article class="card"><h2>Eloquent data</h2><p>Customer and user records are migrated, seeded, and retrieved through Laravel models.</p></article></section>
@endsection
