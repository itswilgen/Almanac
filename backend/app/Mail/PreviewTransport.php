<?php

namespace App\Mail;

use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;

class PreviewTransport extends AbstractTransport
{
    protected function doSend(SentMessage $message): void
    {
        if (! app()->environment('local')) {
            throw new \RuntimeException('Preview mail is local-only. Configure a delivery transport.');
        }
        $dir = storage_path('app/private/mail');
        if (! is_dir($dir)) {
            mkdir($dir, 0700, true);
        }
        $file = $dir.'/'.bin2hex(random_bytes(12)).'.eml';
        file_put_contents($file, $message->toString());
        chmod($file, 0600);
    }

    public function __toString(): string
    {
        return 'preview';
    }
}
