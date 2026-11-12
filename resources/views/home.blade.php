@extends('layouts.app')
@section('title', 'Campus POS')
@section('content')
    <h1>Campus POS</h1>
    <p class="lead">A simple point of sale foundation built with Laravel. Use the navigation to review customer and user accounts supplied through temporary static data.</p>
    <div class="cards">
        <article class="card"><h2>Customer Accounts</h2><p>Review five example customer records.</p><a href="{{ route('customers.index') }}">View customers</a></article>
        <article class="card"><h2>User Accounts</h2><p>Review five example system user records.</p><a href="{{ route('users.index') }}">View users</a></article>
    </div>
@endsection
