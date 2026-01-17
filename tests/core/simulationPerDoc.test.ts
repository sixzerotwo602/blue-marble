/**
 * Per-Doc Style Simulation Test
 * @description Supports detailed logging and Excel export for analysis
 */
import { describe, it, expect } from 'vitest';
import { runLoggedSimulation, saveToExcel } from '../../src/core/simulation/loggedSimulationRunner.js';
import type { SimulationLogs } from '../../src/core/simulation/simulationLogger.js';

describe('Smart AI Simulation (Per-Doc Style)', () => {
    it('Run 1000 games with SMART strategy and export logs', () => {
        const SIMULATION_COUNT = 1000;
        const strategies = ['SMART', 'SMART']; // Both players use SMART

        console.log(`\n🚀 Starting ${SIMULATION_COUNT} games simulation (Smart AI)...`);
        
        const logs: SimulationLogs = runLoggedSimulation(
            SIMULATION_COUNT, 
            ['Smart_AI_1', 'Smart_AI_2'], 
            {
                maxTurns: 1000,
                aiStrategy: 'SMART',
                seed: 'PER_DOC_TEST' // Base seed (runner appends index)
            }
        );

        // Verification
        expect(logs.gameSummaries).toHaveLength(SIMULATION_COUNT);
        expect(logs.turns.length).toBeGreaterThan(0);
        expect(logs.ownerships.length).toBeGreaterThan(0);

        // Display Statistics
        const completedGames = logs.gameSummaries.length;
        const totalTurns = logs.gameSummaries.reduce((sum, g) => sum + g.totalTurns, 0);
        const avgTurns = totalTurns / completedGames;
        const duration = logs.gameSummaries.reduce((sum, g) => sum + g.durationMs, 0);
        const avgDuration = duration / completedGames;
        
        const wins: Record<string, number> = {};
        logs.gameSummaries.forEach(g => {
            wins[g.winner] = (wins[g.winner] || 0) + 1;
        });

        console.log('\n========================================');
        console.log('📊 Simulation Results (1000 Games)');
        console.log('========================================');
        console.log(`Completed Games: ${completedGames}/${SIMULATION_COUNT}`);
        console.log(`Avg Turns: ${avgTurns.toFixed(1)}`);
        console.log(`Avg Duration: ${avgDuration.toFixed(1)}ms`);
        console.log('\nWinner Distribution:');
        Object.entries(wins).forEach(([name, count]) => {
            console.log(`  ${name}: ${count} wins (${(count/completedGames*100).toFixed(1)}%)`);
        });
        console.log('========================================\n');

        // Export to Excel
        saveToExcel(logs, 'smart_ai_simulation.xlsx');
    }, 120000); // 2 minutes timeout
});
