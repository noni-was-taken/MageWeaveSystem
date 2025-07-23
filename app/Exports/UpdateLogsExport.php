<?php

namespace App\Exports;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UpdateLogsExport implements FromCollection, WithHeadings
{
    protected $logs;

    public function __construct(array $logs)
    {
        $this->logs = collect($logs);
    }

    public function collection()
    {
        return $this->logs->map(function ($log) {
            return [
                'update_id' => $log->update_id,
                'value_update' => $log->value_update,
                'product_id' => $log->product_id,
                'description' => $log->description,
                'user_id' => $log->user_id ?? 'N/A',
                'update_date' => $log->update_date,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Update ID',
            'Value Update',
            'Product ID',
            'Description',
            'User ID',
            'Update Date',
        ];
    }
}

