import type { ITextSegment } from "@/types.ts";


const mergeAdjacentSegments = (newSegments:ITextSegment[]) => {
    return newSegments.reduce((acc: ITextSegment[], current: ITextSegment) => {
        if (acc.length === 0) {
            acc.push({ ...current });
            return acc;
        }
        const last = acc[acc.length - 1];
        if (last && last.color === current.color) {
            last.text += current.text;
        } else {
            acc.push({ ...current });
        }
        return acc;
    }, []);
}

/**
 * 將新顏色應用於指定的文字選取範圍，並回傳新的 segments 陣列
 * @param segments - 原始的 segments 陣列
 * @param selectionStart - 選取開始位置
 * @param selectionEnd - 選取結束位置
 * @param newColor - 要應用的新顏色
 */
export const applyColorToSelection = (
    segments: ITextSegment[],
    selectionStart: number,
    selectionEnd: number,
    newColor: string
): ITextSegment[] => {
    const newSegments: ITextSegment[] = [];
    let currentIndex = 0;

    segments.forEach(segment => {
        const segmentEnd = currentIndex + segment.text.length;

        // Case 1: Segment is completely outside the selection
        if (segmentEnd <= selectionStart || currentIndex >= selectionEnd) {
            newSegments.push(segment);
        }
        // Case 2: Segment is completely inside the selection
        else if (currentIndex >= selectionStart && segmentEnd <= selectionEnd) {
            newSegments.push({ ...segment, color: newColor });
        }
        // Case 3: Segment is partially selected (needs splitting)
        else {
            const text = segment.text;
            // Part before selection
            if (currentIndex < selectionStart) {
                const beforeText = text.substring(0, selectionStart - currentIndex);
                newSegments.push({ ...segment, text: beforeText });
            }

            // Part inside selection
            const selectedPartStart = Math.max(0, selectionStart - currentIndex);
            const selectedPartEnd = Math.min(text.length, selectionEnd - currentIndex);
            const selectedText = text.substring(selectedPartStart, selectedPartEnd);
            if (selectedText) {
                newSegments.push({ ...segment, text: selectedText, color: newColor });
            }

            // Part after selection
            if (segmentEnd > selectionEnd) {
                const afterText = text.substring(selectionEnd - currentIndex);
                newSegments.push({ ...segment, text: afterText });
            }
        }
        currentIndex = segmentEnd;
    });

    // 使用 reduce 來合併顏色相同的相鄰 segment，避免文字丟失
    if (newSegments.length === 0) {
        return [];
    }
    
    return mergeAdjacentSegments(newSegments);
};

/**
 * 當 textarea 文字內容改變時，智慧地更新 segments 陣列。
 * @param oldSegments - 修改前的 segments 陣列。
 * @param newText - textarea 中最新的完整文字內容。
 * @returns - 返回更新後的 segments 陣列。
 */
export const updateSegmentsOnTextChange = (
    oldSegments: ITextSegment[],
    newText: string
): ITextSegment[] => {
    const oldText = oldSegments.map(s => s.text).join('');

    // 1. 找出變動的起始點 (從頭部開始比較)
    let start = 0;
    while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
        start++;
    }

    // 2. 找出變動的結束點 (從尾部開始比較)
    let oldEnd = oldText.length;
    let newEnd = newText.length;
    while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
        oldEnd--;
        newEnd--;
    }

    // 3. 取得被插入的新文字
    const insertedText = newText.substring(start, newEnd);

    // 4. 找到插入點應該繼承的顏色
    // 我們根據游標位置(selectionStart)的前一個字元來決定顏色
    // 如果游標在最前面，則使用第一個 segment 的顏色
    const colorTargetIndex = Math.max(0, start - 1);
    let inheritedColor = '#000000'; // 預設顏色
    let currentIndex = 0;
    for (const segment of oldSegments) {
        if (colorTargetIndex < currentIndex + segment.text.length) {
            inheritedColor = segment.color || '#000000';
            break;
        }
        currentIndex += segment.text.length;
    }

    // 5. 智慧地重組 segments
    const newSegments: ITextSegment[] = [];
    currentIndex = 0;
    for (const segment of oldSegments) {
        const segmentEnd = currentIndex + segment.text.length;
        // 將變動區塊前的部分加入
        if (currentIndex < start) {
            const text = segment.text.substring(0, start - currentIndex);
            if (text) newSegments.push({ ...segment, text });
        }
        // 將變動區塊後的部分加入
        if (segmentEnd > oldEnd) {
            const text = segment.text.substring(oldEnd - currentIndex);
            if (text) newSegments.push({ ...segment, text });
        }
        currentIndex = segmentEnd;
    }

    // 6. 將新插入的文字 segment 插入到正確的位置
    const newSegment = { text: insertedText, color: inheritedColor };
    // 找到插入位置
    let insertionIndex = 0;
    for (let i = 0; i < newSegments.length; i++) {
        const segmentText = newSegments[i]?.text || '';
        if (newText.indexOf(segmentText) > start) {
            break;
        }
        insertionIndex = i + 1;
    }
    if (newSegment.text) {
        newSegments.splice(insertionIndex, 0, newSegment);
    }

    // 7. 合併相鄰且顏色相同的 segment
    return mergeAdjacentSegments(newSegments);
};