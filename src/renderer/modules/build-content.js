const BUILD_CONTENT_KINDS = new Set([
    'file',
    'files',
    'folder',
    'folders',
    'file_and_folder',
    'files_and_folders'
]);

export function resolveBuildContentKind({ files = 0, folders = 0 } = {}) {
    const fileCount = Math.max(0, Number(files) || 0);
    const folderCount = Math.max(0, Number(folders) || 0);

    if (fileCount === 1 && folderCount === 1) { return 'file_and_folder'; }
    if (fileCount > 0 && folderCount > 0) { return 'files_and_folders'; }
    if (folderCount === 1) { return 'folder'; }
    if (folderCount > 1) { return 'folders'; }
    if (fileCount === 1) { return 'file'; }
    return 'files';
}

export function getBuildContentI18nKeys(counts) {
    const kind = resolveBuildContentKind(counts);
    const safeKind = BUILD_CONTENT_KINDS.has(kind) ? kind : 'files_and_folders';
    return {
        kind: safeKind,
        title: `build_output_${safeKind}`,
        description: `build_output_${safeKind}_desc`
    };
}
