<?php

namespace App\Http\Controllers;

use App\Exports\UpdateLogsExport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class RecordExportController extends Controller
{
    public function autoExportWeeklyLogs()
{
    $earliestLog = DB::table('updateinfo')->orderBy('update_date', 'asc')->first();
    $latestLog   = DB::table('updateinfo')->orderBy('update_date', 'desc')->first();

    if (!$earliestLog || !$latestLog) {
        return;
    }

    $start = Carbon::parse($earliestLog->update_date)->startOfWeek(Carbon::MONDAY);
    $end   = Carbon::parse($latestLog->update_date)->endOfWeek(Carbon::SUNDAY);

    $now = Carbon::now();

    while ($start->lessThanOrEqualTo($end)) {
        $weekStart = $start->copy();
        $weekEnd   = $start->copy()->endOfWeek(Carbon::SUNDAY);

        $logs = DB::table('updateinfo')
            ->whereBetween('update_date', [$weekStart, $weekEnd])
            ->get();

        if ($logs->isNotEmpty()) {
            $filename = 'weekly_update_' . $weekStart->format('Ymd') . '_to_' . $weekEnd->format('Ymd') . '.xlsx';
            $path = 'weekly_exports/' . $filename;

            $record = DB::table('records')
                ->whereDate('startDay', $weekStart)
                ->whereDate('endDay', $weekEnd)
                ->first();

            // ✅ CASE 1: If it's the current week — overwrite the file
            if ($now->between($weekStart, $weekEnd)) {
                Excel::store(new UpdateLogsExport($logs), $path, 'local');

                if ($record) {
                    // Update existing record
                    DB::table('records')
                        ->where('record_id', $record->record_id)
                        ->update([
                            'sheet_file' => $path,
                            'updated_at' => now(),
                        ]);
                } else {
                    // Insert new record
                    DB::table('records')->insert([
                        'startDay' => $weekStart,
                        'endDay' => $weekEnd,
                        'sheet_file' => $path,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // ✅ CASE 2: If it's a past week and not yet recorded — create new file
            elseif (!$record) {
                Excel::store(new UpdateLogsExport($logs), $path, 'local');

                DB::table('records')->insert([
                    'startDay' => $weekStart,
                    'endDay' => $weekEnd,
                    'sheet_file' => $path,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $start->addWeek();
    }
}
}