<?php

namespace App\Enums;

enum CredentialStatus: string
{
    case DRAFT = 'draft';
    case PENDING_APPROVAL = 'pending_approval';
    case APPROVED = 'approved';
    case ISSUED = 'issued';
    case REVOKED = 'revoked';
    case SUPERSEDED = 'superseded';
}
