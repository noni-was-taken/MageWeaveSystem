<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>MageWeave</title>
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="bg-blue text-gray-900">
    @inertia
    <script>
        window.addEventListener('DOMContentLoaded', () => {
            document.body.classList.remove('bg-blue');
        });
    </script>
</body>
