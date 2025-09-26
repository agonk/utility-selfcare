<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
        }
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
        }
        .url-display {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Termokos Self-Care</div>
        </div>

        <h1>Hello {{ $userName }},</h1>

        <p>Thank you for registering with Termokos Self-Care Portal. To complete your registration and access your account, please verify your email address.</p>

        <div style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
        </div>

        <p>Or copy and paste this URL into your browser:</p>
        <div class="url-display">{{ $verificationUrl }}</div>

        <div class="warning">
            <strong>Important:</strong> This verification link will expire {{ $expiresIn }}. If the link expires, you can request a new one from the login page.
        </div>

        <p>If you didn't create an account with Termokos Self-Care, please ignore this email.</p>

        <div class="footer">
            <p>This is an automated email from Termokos Self-Care Portal.</p>
            <p>Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Termokos. All rights reserved.</p>
        </div>
    </div>
</body>
</html>