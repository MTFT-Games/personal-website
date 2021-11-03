<?php
// Auto pull from the GitHub repo based on a webhook.

if ($_POST) {
    // Check the GitHub secret
    //if (hash_equals('sha256=' +
    //        hash_hmac(
    //        'sha256', 
    //        $_POST, $_ENV['HTTP_GITHUB_SECRET']), 
    //    $_SERVER['HTTP__X_HUB_SIGNATURE_256'])) {

        shell_exec( 'cd /var/www/html/ && git pull origin main')
    //}else {
    //    header("HTTP/1.1 403 Forbidden");
    //}
}else {
        header("HTTP/1.1 400 Bad Request");
    }
?>