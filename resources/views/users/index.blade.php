@extends('layouts.app')
@section('content')
<div class="page-head"><p class="eyebrow">Account management</p><h1>User Accounts</h1><p class="lead">User records retrieved from the database through <code>User</code> Eloquent models.</p></div><div class="table-wrap"><table><thead><tr><th>User ID</th><th>Username</th><th>Full Name</th></tr></thead><tbody>@foreach ($users as $user)<tr><td>{{ $user->id }}</td><td>{{ $user->username }}</td><td>{{ $user->full_name }}</td></tr>@endforeach</tbody></table></div>
@endsection
