<?php

namespace App\Http\Controllers;

use App\Exports\UpdateLogsExport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class RecordExportController extends Controller
{
    public function autoExportLogs()
{
    $earliestLog = DB::table('updateinfo')->orderBy('update_date', 'asc')->first();
    $latestLog   = DB::table('updateinfo')->orderBy('update_date', 'desc')->first();

    if (!$earliestLog || !$latestLog) {
        return;
    }

    $start = Carbon::parse($earliestLog->update_date)->startOfWeek(Carbon::MONDAY);
    $end   = Carbon::parse($latestLog->update_date)->endOfWeek(Carbon::SUNDAY);
    $now   = Carbon::now();

    // 🟢 1. Weekly exports (existing logic)
    while ($start->lessThanOrEqualTo($end)) {
        $weekStart = $start->copy();
        $weekEnd = $start->copy()->endOfWeek(Carbon::SUNDAY);

        $logs = DB::select("SELECT * FROM updateinfo WHERE update_date BETWEEN ? AND ?", [
            $weekStart, $weekEnd
        ]);

        if (count($logs)) {
            $filename = 'weekly_update_' . $weekStart->format('Ymd') . '_to_' . $weekEnd->format('Ymd') . '.xlsx';
            $path = 'weekly_exports/' . $filename;

            $record = DB::table('records')
                ->whereDate('startDay', $weekStart)
                ->whereDate('endDay', $weekEnd)
                ->where('is_monthly', false)
                ->first();

            if ($now->between($weekStart, $weekEnd)) {
                Excel::store(new UpdateLogsExport($logs), $path, 'local');

                if ($record) {
                    DB::table('records')->where('record_id', $record->record_id)->update([
                        'sheet_file' => $path,
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('records')->insert([
                        'startDay' => $weekStart,
                        'endDay' => $weekEnd,
                        'sheet_file' => $path,
                        'is_monthly' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } elseif (!$record) {
                Excel::store(new UpdateLogsExport($logs), $path, 'local');

                DB::table('records')->insert([
                    'startDay' => $weekStart,
                    'endDay' => $weekEnd,
                    'sheet_file' => $path,
                    'is_monthly' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $start->addWeek();
    }

    // 🟢 2. Monthly exports
    $monthStart = Carbon::parse($earliestLog->update_date)->startOfMonth();
    $monthEnd = Carbon::parse($latestLog->update_date)->endOfMonth();

    while ($monthStart->lessThanOrEqualTo($monthEnd)) {
        $monthFrom = $monthStart->copy()->startOfMonth();
        $monthTo = $monthStart->copy()->endOfMonth();

        $logs = DB::select("SELECT * FROM updateinfo WHERE update_date BETWEEN ? AND ?", [
            $monthFrom, $monthTo
        ]);

        if (count($logs)) {
            $filename = 'monthly_update_' . $monthFrom->format('Y_m') . '.xlsx';
            $path = 'monthly_exports/' . $filename;

            $record = DB::table('records')
                ->whereDate('startDay', $monthFrom)
                ->whereDate('endDay', $monthTo)
                ->where('is_monthly', true)
                ->first();

            if (!$record) {
                Excel::store(new UpdateLogsExport($logs), $path, 'local');

                DB::table('records')->insert([
                    'startDay' => $monthFrom,
                    'endDay' => $monthTo,
                    'sheet_file' => $path,
                    'is_monthly' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $monthStart->addMonth();
    }

    return response()->json(['message' => 'Weekly & Monthly logs exported successfully']);
    }   
}