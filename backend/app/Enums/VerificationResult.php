<?php

namespace App\Enums;

enum VerificationResult: string
{
    case VALID = 'VALID';
    case INVALID = 'INVALID';
    case REVOKED = 'REVOKED';
    case SUPERSEDED = 'SUPERSEDED';
    case NOT_FOUND = 'NOT_FOUND';
}
