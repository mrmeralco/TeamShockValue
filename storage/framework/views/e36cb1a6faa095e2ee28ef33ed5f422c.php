<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>"><title>Sign in — Meralco Shockvalue</title>
  <link rel="stylesheet" href="<?php echo e(asset('styles.css')); ?>">
  <style>body{min-height:100vh;display:grid;place-items:center;background:#f7f7f3}.auth-card{width:min(430px,calc(100% - 32px));padding:34px;background:#fff;border:1px solid var(--line);box-shadow:0 22px 70px rgba(16,24,24,.1)}.auth-card h1{margin:8px 0;font-size:32px}.auth-card p{color:var(--muted);line-height:1.6}.auth-card form{display:grid;gap:14px;margin-top:24px}.auth-card label{display:grid;gap:6px;color:var(--muted);font:10px 'DM Mono',monospace;text-transform:uppercase}.auth-card input{padding:12px;border:1px solid var(--line);font:14px 'DM Sans',sans-serif}.auth-card button{width:100%;margin-top:6px}.auth-link{text-align:center;font-size:13px}.error{color:#a33b32;font-size:13px}</style>
</head>
<body><main class="auth-card"><div class="eyebrow">MERALCO / SHOCKVALUE</div><h1>Welcome back.</h1><p>Sign in to see your live energy dashboard and connected breaker channels.</p>
<?php if($errors->any()): ?><div class="error"><?php echo e($errors->first()); ?></div><?php endif; ?>
<form method="POST" action="<?php echo e(route('login.submit')); ?>"><?php echo csrf_field(); ?><label>Email<input type="email" name="email" value="<?php echo e(old('email')); ?>" required autofocus></label><label>Password<input type="password" name="password" required></label><button class="button button-primary" type="submit">Sign in</button></form>
<p class="auth-link">New to Shockvalue? <a href="<?php echo e(route('signup')); ?>">Create an account</a></p></main></body></html>
<?php /**PATH C:\Users\falqu\Downloads\LINDBERGH\MeralcoShockvalue\Test2\TeamShockValue-larval\resources\views/auth/login.blade.php ENDPATH**/ ?>