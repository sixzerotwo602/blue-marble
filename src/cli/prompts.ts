// readline 래퍼 - 비동기 프롬프트

import * as readline from 'readline';

let rl: readline.Interface | null = null;

/** readline 인터페이스 초기화 */
export function initReadline(): void {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
}

/** readline 인터페이스 종료 */
export function closeReadline(): void {
  if (rl) {
    rl.close();
    rl = null;
  }
}

/** 프롬프트 표시 후 입력 받기 */
export function prompt(question: string): Promise<string> {
  initReadline();
  return new Promise((resolve) => {
    rl!.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/** 숫자 입력 받기 (범위 검증 포함) */
export async function promptNumber(
  question: string,
  min: number,
  max: number
): Promise<number> {
  while (true) {
    const input = await prompt(question);
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      return num;
    }
    console.log(`${min}~${max} 사이의 숫자를 입력하세요.`);
  }
}

/** Y/N 입력 받기 */
export async function promptYesNo(question: string): Promise<boolean> {
  while (true) {
    const input = await prompt(question);
    const lower = input.toLowerCase();
    if (lower === 'y' || lower === 'yes' || lower === '예') {
      return true;
    }
    if (lower === 'n' || lower === 'no' || lower === '아니오') {
      return false;
    }
    console.log('Y 또는 N을 입력하세요.');
  }
}

/** Enter 키 대기 */
export async function promptEnter(message: string = '[Enter] 계속...'): Promise<void> {
  await prompt(message);
}

/** 메뉴 선택 (0~max 범위) */
export async function promptMenu(
  menuItems: string[],
  question: string = '선택: '
): Promise<number> {
  return promptNumber(question, 0, menuItems.length - 1);
}
