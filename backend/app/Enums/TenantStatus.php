<?php

namespace App\Enums;

enum TenantStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case REJECTED = 'rejected';
    case CLOSED = 'closed';
}
