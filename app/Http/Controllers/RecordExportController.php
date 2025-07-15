<?php

namespace App\Http\Controllers;

use App\Exports\UpdateLogsExport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class UpdateLogsController extends Controller
{
    public function autoExportWeeklyLogs()
    {
        // Get earliest and latest update log date
        $earliestLog = DB::table('updateinfo')->orderBy('update_date', 'asc')->first();
        $latestLog   = DB::table('updateinfo')->orderBy('update_date', 'desc')->first();

        if (!$earliestLog || !$latestLog) {
            return response()->json(['message' => 'No logs to export.'], 404);
        }

        $start = Carbon::parse($earliestLog->update_date)->startOfWeek(Carbon::SUNDAY);
        $end   = Carbon::parse($latestLog->update_date)->endOfWeek(Carbon::SATURDAY);

        while ($start->lessThanOrEqualTo($end)) {
            $weekStart = $start->copy();
            $weekEnd   = $start->copy()->endOfWeek(Carbon::SATURDAY);

            // Check if already exported
            $exists = DB::table('records')
                ->whereDate('startDay', $weekStart)
                ->whereDate('endDay', $weekEnd)
                ->exists();

            if (!$exists) {
                // Get logs for this week
                $logs = DB::table('updateinfo')
                    ->whereBetween('update_date', [$weekStart, $weekEnd])
                    ->get();

                if ($logs->isNotEmpty()) {
                    $filename = 'weekly_update_' . $weekStart->format('Ymd') . '_to_' . $weekEnd->format('Ymd') . '.xlsx';
                    $path = 'weekly_exports/' . $filename;

                    Excel::store(new UpdateLogsExport($logs), $path, 'local');

                    // Store record
                    DB::table('records')->insert([
                        'startDay'   => $weekStart,
                        'endDay'     => $weekEnd,
                        'sheet_file' => $path,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $start->addWeek(); // Move to next week
        }

        return response()->json(['message' => 'Weekly logs exported successfully.']);
    }
}