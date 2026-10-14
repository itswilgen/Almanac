<?php

namespace App\Domain;

class FertilityPolicy
{
    // There is deliberately no runtime/admin switch that can enable this policy.
    public function evaluate(array $records = [], array $circumstances = []): array
    {
        return ['available' => false, 'policy_version' => 'unreviewed-v1', 'classification' => null, 'reason' => 'Fertility estimates are not available. A qualified healthcare professional must review the method, eligibility checks, wording, and implementation before this feature can be introduced.'];
    }
}
