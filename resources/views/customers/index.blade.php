@extends('layouts.app')
@section('content')
<div class="page-head"><p class="eyebrow">Account management</p><h1>Customer Accounts</h1><p class="lead">Customer records retrieved from the database through <code>Customer</code> Eloquent models.</p></div><div class="table-wrap"><table><thead><tr><th>Customer ID</th><th>Full Name</th><th>Email</th><th>Phone</th></tr></thead><tbody>@foreach ($customers as $customer)<tr><td>{{ $customer->id }}</td><td>{{ $customer->full_name }}</td><td>{{ $customer->email }}</td><td>{{ $customer->phone }}</td></tr>@endforeach</tbody></table></div>
@endsection
