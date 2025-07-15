<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Exports\UpdateLogsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ExportWeeklyLogs extends Command
{
    protected $signature = 'logs:export-weekly';
    protected $description = 'Export update logs weekly and store the file info';

    public function handle()
    {
        $latestRecord = DB::table('records')->latest('endDay')->first();
        $start = $latestRecord ? Carbon::parse($latestRecord->endDay)->addDay() : Carbon::parse('2024-01-01');
        $now = now();

        while ($start->lt($now)) {
            $end = (clone $start)->endOfWeek(Carbon::SUNDAY);
            $logs = DB::table('updateinfo')
                      ->whereBetween('update_date', [$start, $end])
                      ->get();

            if ($logs->isNotEmpty()) {
                $filename = 'update_logs_' . $start->format('Ymd') . '_to_' . $end->format('Ymd') . '.xlsx';
                Excel::store(new UpdateLogsExport($logs), $filename, 'public');

                DB::table('records')->insert([
                    'startDay' => $start,
                    'endDay' => $end,
                    'sheet_file' => $filename,
                ]);

                $this->info("Exported logs for {$start->toDateString()} - {$end->toDateString()}");
            }

            $start = $end->addDay();
        }
    }
}