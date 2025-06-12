import { BaseAlignKit } from './plugins/align-base-kit';
import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from './plugins/basic-marks-base-kit';
import { BaseCodeBlockKit } from './plugins/code-block-base-kit';
import { BaseColumnKit } from './plugins/column-base-kit';
import { BaseDateKit } from './plugins/date-base-kit';
import { BaseFontKit } from './plugins/font-base-kit';
import { BaseLineHeightKit } from './plugins/line-height-base-kit';
import { BaseLinkKit } from './plugins/link-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { MarkdownKit } from './plugins/markdown-kit';
import { BaseTableKit } from './plugins/table-base-kit';
import { BaseTocKit } from './plugins/toc-base-kit';

export const BaseEditorKit = [
    ...BaseBasicBlocksKit,
    ...BaseCodeBlockKit,
    ...BaseTableKit,
    ...BaseTocKit,
    ...BaseColumnKit,
    ...BaseDateKit,
    ...BaseLinkKit,
    ...BaseBasicMarksKit,
    ...BaseFontKit,
    ...BaseListKit,
    ...BaseAlignKit,
    ...BaseLineHeightKit,
    ...MarkdownKit,
];