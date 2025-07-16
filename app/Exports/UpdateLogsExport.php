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

    public function __construct($logs)
    {
        $this->logs = $logs;
    }

    public function collection()
    {
        return collect($this->logs);
    }

    public function headings(): array
    {
        return [
            'Update ID',
            'Value Update',
            'Product ID',
            'Description',
            'Update Date'
        ];
    }
}
