<?php
// Auto pull from the GitHub repo based on a webhook.

$post_data = file_get_contents('php://input');
$github_secret = getenv('HTTP_GITHUB_SECRET');
$computed_hash = 'sha256=' . hash_hmac('sha256', $post_data, $github_secret);
$sent_hash = $_SERVER['HTTP_X_HUB_SIGNATURE_256'];

if ($post_data) {
    // Check the GitHub secret
    if (hash_equals($computed_hash, $sent_hash)) {
        // Pull from GitHub
        shell_exec('cd /var/www/html/ && git pull origin main');
        echo "Pull from main successfully triggered.";
        error_log("GitHub pull triggered by " . $_SERVER['REMOTE_ADDR']);
    }else {
        header("HTTP/1.1 403 Forbidden");
        echo "The signature sent with this request did not match the secret on record.";
        error_log("GitHub autopull attempted by " . $_SERVER['REMOTE_ADDR'] . 
        " with wrong hash.");

    }
}else {
    header("HTTP/1.1 400 Bad Request");
    echo "This is not a valid request. This url is meant to receive post messages 
    from GitHub whenever the repo is pushed to. That is not what you sent.";
    error_log("Invalid request sent to github autopull by " . $_SERVER['REMOTE_ADDR']);
}
?>