<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PagesTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_all_required_pages_are_available(): void
    {
        $this->assertSame(5, Customer::count());
        $this->assertSame(5, User::count());

        $this->get('/')->assertOk()->assertSee('Campus POS');
        $this->get('/about')->assertOk()->assertSee('About Campus POS');
        $this->get('/customers')->assertOk()->assertSee('Customer Accounts')->assertSee('Avery Santos');
        $this->get('/users')->assertOk()->assertSee('User Accounts')->assertSee('Jamie Dela Cruz');
    }
}
