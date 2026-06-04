<?php

return [
    // Komisi platform atas setiap transaksi (persen).
    // ASUMSI A2: ditetapkan 0% — ubah nilai ini bila kebijakan berubah.
    'platform_commission_percent' => env('TRAVELINK_COMMISSION_PERCENT', 0),
];
