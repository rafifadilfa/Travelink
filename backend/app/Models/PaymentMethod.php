<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{

    protected $table = 'payment_methods'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'name',
    ]; // specify the fillable attributes for mass assignment

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'payment_method_id'); // every payment method can be used in many transactions
    }
}
