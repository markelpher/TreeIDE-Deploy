export function createFileTypes(app) {


const FILE_TYPES = {
        // JavaScript/TypeScript
        js:   { label: 'JavaScript' },
        mjs:  { label: 'JavaScript' },
        cjs:  { label: 'JavaScript' },
        ts:   { label: 'TypeScript' },
        mts:  { label: 'TypeScript' },
        cts:  { label: 'TypeScript' },
        jsx:  { label: 'React JSX' },
        tsx:  { label: 'React TSX' },

        // Python/Ruby/Java
        py:   { label: 'Python' },
        pyw:  { label: 'Python' },
        rb:   { label: 'Ruby' },
        java: { label: 'Java' },
        kt:   { label: 'Kotlin' },
        kts:  { label: 'Kotlin' },

        // C/C++/C#
        c:    { label: 'C' },
        h:    { label: 'filetype_c_header', i18n: true },
        cpp:  { label: 'C++' },
        cxx:  { label: 'C++' },
        cc:   { label: 'C++' },
        hpp:  { label: 'filetype_cpp_header', i18n: true },
        hh:   { label: 'filetype_cpp_header', i18n: true },
        hxx:  { label: 'filetype_cpp_header', i18n: true },
        cs:   { label: 'C#' },

        // Systems/compiled
        go:   { label: 'Go' },
        rs:   { label: 'Rust' },
        swift:{ label: 'Swift' },
        php:  { label: 'PHP' },
        lua:  { label: 'Lua' },
        r:    { label: 'R' },
        dart: { label: 'Dart' },
        scala:{ label: 'Scala' },

        // Other languages
        zig:  { label: 'Zig' },
        nim:  { label: 'Nim' },
        cr:   { label: 'Crystal' },
        ex:   { label: 'Elixir' },
        exs:  { label: 'Elixir' },
        erl:  { label: 'Erlang' },
        hrl:  { label: 'Erlang' },
        clj:  { label: 'Clojure' },
        cljs: { label: 'Clojure' },
        hs:   { label: 'Haskell' },
        lhs:  { label: 'Haskell' },
        ml:   { label: 'OCaml' },
        mli:  { label: 'OCaml' },
        fs:   { label: 'F#' },
        fsx:  { label: 'F#' },
        fsi:  { label: 'F#' },
        jl:   { label: 'Julia' },
        pl:   { label: 'Perl' },
        pm:   { label: 'Perl' },
        pas:  { label: 'Pascal' },
        pp:   { label: 'Pascal' },
        lpr:  { label: 'Pascal' },
        f:    { label: 'Fortran' },
        f90:  { label: 'Fortran' },
        f95:  { label: 'Fortran' },
        for:  { label: 'Fortran' },
        ada:  { label: 'Ada' },
        adb:  { label: 'Ada' },
        ads:  { label: 'Ada' },
        cob:  { label: 'COBOL' },
        cbl:  { label: 'COBOL' },
        m:    { label: 'Objective-C' },
        mm:   { label: 'Objective-C++' },
        coffee:{ label: 'CoffeeScript' },
        litcoffee:{ label: 'CoffeeScript' },
        groovy:{ label: 'Groovy' },
        gradle:{ label: 'Gradle' },
        gvy:  { label: 'Groovy' },

        // Blockchain
        sol:  { label: 'Solidity' },
        vy:   { label: 'Vyper' },

        // Config/Data formats
        proto:{ label: 'Protobuf' },
        tf:   { label: 'Terraform' },
        hcl:  { label: 'HCL' },

        // Shell
        sh:   { label: 'Shell' },
        bash: { label: 'Bash' },
        zsh:  { label: 'Zsh' },
        fish: { label: 'Fish' },
        ksh:  { label: 'Ksh' },
        csh:  { label: 'Csh' },
        ps1:  { label: 'PowerShell' },
        psm1: { label: 'PowerShell' },
        psd1: { label: 'PowerShell' },
        bat:  { label: 'Batch' },
        cmd:  { label: 'Batch' },

        // Web
        html: { label: 'HTML' },
        htm:  { label: 'HTML' },
        css:  { label: 'CSS' },
        scss: { label: 'SCSS' },
        sass: { label: 'Sass' },
        less: { label: 'Less' },
        styl: { label: 'Stylus' },
        stylus:{ label: 'Stylus' },

        // Data/Config
        json: { label: 'JSON' },
        jsonc:{ label: 'JSONC' },
        json5:{ label: 'JSON5' },
        jsonl:{ label: 'filetype_json_lines', i18n: true },
        xml:  { label: 'XML' },
        yaml: { label: 'YAML' },
        yml:  { label: 'YAML' },
        toml: { label: 'TOML' },
        ini:  { label: 'INI' },
        cfg:  { label: 'filetype_config', i18n: true },
        conf: { label: 'filetype_config', i18n: true },
        cnf:  { label: 'filetype_config', i18n: true },

        // Database/API
        sql:  { label: 'SQL' },
        prisma:{ label: 'Prisma' },

        // Documentation
        md:   { label: 'Markdown' },
        markdown:{ label: 'Markdown' },
        rst:  { label: 'filetype_restructuredtext', i18n: true },
        adoc: { label: 'AsciiDoc' },
        asciidoc:{ label: 'AsciiDoc' },
        txt:  { label: 'filetype_text', i18n: true },
        csv:  { label: 'CSV' },
        tsv:  { label: 'TSV' },

        // DevOps/Config files
        env:  { label: 'filetype_env', i18n: true },
        dockerfile:{ label: 'filetype_dockerfile', i18n: true },
        makefile:{ label: 'filetype_makefile', i18n: true },
        mk:   { label: 'filetype_makefile', i18n: true },
        cmake:{ label: 'CMake' },

        // Frontend frameworks
        vue:  { label: 'Vue' },
        svelte:{ label: 'Svelte' },
        astro:{ label: 'Astro' },
        qwik: { label: 'Qwik' },

        // Templating
        pug:  { label: 'Pug' },
        jade: { label: 'Pug' },
        hbs:  { label: 'Handlebars' },
        handlebars:{ label: 'Handlebars' },
        mustache:{ label: 'Mustache' },
        njk:  { label: 'Nunjucks' },
        liquid:{ label: 'Liquid' },

        // WebAssembly
        wat:  { label: 'filetype_webassembly_text', i18n: true },
        wasm: { label: 'WebAssembly' },

        // Shaders
        glsl: { label: 'GLSL' },
        hlsl: { label: 'HLSL' },
        wgsl: { label: 'WGSL' },
        vert: { label: 'filetype_vertex', i18n: true, labelPrefix: 'GLSL ' },
        frag: { label: 'filetype_fragment', i18n: true, labelPrefix: 'GLSL ' },
        comp: { label: 'filetype_compute', i18n: true, labelPrefix: 'GLSL ' },

        // Server config
        'docker-compose':{ label: 'filetype_docker_compose', i18n: true },
        nginx:{ label: 'Nginx' },
        htaccess:{ label: 'Apache' },

        // Dotfiles
        gitignore:{ label: 'filetype_git', i18n: true },
        gitkeep:{ label: 'filetype_git', i18n: true },
        gitattributes:{ label: 'filetype_git', i18n: true },
        editorconfig:{ label: 'EditorConfig' },
        prettierrc:{ label: 'Prettier' },
        eslintrc:{ label: 'ESLint' },
        npmrc: { label: 'npm' },
        nvmrc: { label: 'Node' },
        browserslistrc:{ label: 'Browserslist' },
        babelrc:{ label: 'Babel' },

        // Other
        lock: { label: '' },
        map:  { label: '' },
        'd.ts':{ label: 'TypeScript' },
        spec: { label: '' },
        test: { label: '' },

        // Media
        png:  { label: 'PNG' },
        jpg:  { label: 'JPEG' },
        jpeg: { label: 'JPEG' },
        gif:  { label: 'GIF' },
        svg:  { label: 'SVG' },
        webp: { label: 'WebP' },
        ico:  { label: 'ICO' },
        bmp:  { label: 'BMP' },
        tiff: { label: 'TIFF' },
        tif:  { label: 'TIFF' },
        avif: { label: 'AVIF' },

        // Audio
        mp3:  { label: 'MP3' },
        wav:  { label: 'WAV' },
        ogg:  { label: 'OGG' },
        flac: { label: 'FLAC' },
        aac:  { label: 'AAC' },
        m4a:  { label: 'M4A' },
        wma:  { label: 'WMA' },

        // Video
        mp4:  { label: 'MP4' },
        webm: { label: 'WebM' },
        avi:  { label: 'AVI' },
        mov:  { label: 'MOV' },
        mkv:  { label: 'MKV' },
        flv:  { label: 'FLV' },
        wmv:  { label: 'WMV' },

        // Documents
        pdf:  { label: 'PDF' },
        doc:  { label: 'DOC' },
        docx: { label: 'DOCX' },
        xls:  { label: 'XLS' },
        xlsx: { label: 'XLSX' },
        ppt:  { label: 'PPT' },
        pptx: { label: 'PPTX' },
        odt:  { label: 'ODT' },
        ods:  { label: 'ODS' },
        odp:  { label: 'ODP' },

        // Archives
        zip:  { label: 'ZIP' },
        tar:  { label: 'TAR' },
        gz:   { label: 'GZ' },
        rar:  { label: 'RAR' },
        '7z': { label: '7Z' },
        bz2:  { label: 'BZ2' },
        xz:   { label: 'XZ' },
        tgz:  { label: 'TGZ' },
        tbz2: { label: 'TBZ2' },
        txz:  { label: 'TXZ' },
        zst:  { label: 'ZST' },
        cab:  { label: 'CAB' },
        iso:  { label: 'ISO' },
        dmg:  { label: 'DMG' },
        lz:   { label: 'LZ' },
        lzma: { label: 'LZMA' },
        z:    { label: 'Z' },

        // Fonts
        woff: { label: 'WOFF' },
        woff2:{ label: 'WOFF2' },
        ttf:  { label: 'TTF' },
        otf:  { label: 'OTF' },
        eot:  { label: 'EOT' },

        // Misc
        tree: { label: 'Tree' },
        log:  { label: 'filetype_log', i18n: true },
        diff: { label: 'filetype_diff', i18n: true },
        patch:{ label: 'filetype_patch', i18n: true },
        rls:  { label: '' }
    };

    // Filename-based detection (exact matches, case-insensitive)
    const FILENAME_MAP = {
        'dockerfile': 'filetype_dockerfile',
        'docker-compose': 'filetype_docker_compose',
        'compose.yml': 'filetype_docker_compose',
        'compose.yaml': 'filetype_docker_compose',
        'makefile': 'filetype_makefile',
        'gnumakefile': 'filetype_makefile',
        'cmakelists.txt': 'CMake',
        '.gitignore': 'filetype_git',
        '.gitkeep': 'filetype_git',
        '.gitattributes': 'filetype_git',
        '.env': 'filetype_env',
        '.htaccess': 'Apache',
        '.htpasswd': 'Apache',
        'nginx.conf': 'Nginx',
        '.editorconfig': 'EditorConfig',
        '.prettierrc': 'Prettier',
        '.prettierrc.json': 'Prettier',
        '.prettierrc.js': 'Prettier',
        '.eslintrc': 'ESLint',
        '.eslintrc.json': 'ESLint',
        '.eslintrc.js': 'ESLint',
        '.npmrc': 'npm',
        '.nvmrc': 'Node',
        '.browserslistrc': 'Browserslist',
        '.babelrc': 'Babel',
        'babel.config.js': 'Babel',
        'cargo.toml': 'Cargo',
        'package.json': 'npm',
        'requirements.txt': 'Python',
        'setup.py': 'Python',
        'pyproject.toml': 'Python',
        'gemfile': 'Ruby',
        'gemfile.lock': 'Ruby',
        'go.mod': 'Go',
        'go.sum': 'Go',
        'cargo.lock': 'Cargo',
        'license': 'filetype_license',
        'licence': 'filetype_license',
        'readme': 'filetype_readme',
        'readme.md': 'filetype_readme',
        'changelog': 'filetype_changelog',
        'changelog.md': 'filetype_changelog',
        'procfile': 'filetype_procfile',
        'vagrantfile': 'Vagrant',
        'rakefile': 'Ruby',
        'gruntfile.js': 'filetype_task_runner',
        'gulpfile.js': 'filetype_task_runner'
    };

    // i18n keys that need translation for FILENAME_MAP
    const FILENAME_I18N_KEYS = new Set([
        'filetype_dockerfile', 'filetype_docker_compose', 'filetype_makefile',
        'filetype_git', 'filetype_env', 'filetype_license', 'filetype_readme',
        'filetype_changelog', 'filetype_procfile', 'filetype_task_runner'
    ]);

    const validExtensions = new Set(Object.keys(FILE_TYPES));
    const PRESENCE_TEXT_EXTENSIONS = new Set([
        'txt', 'text', 'md', 'markdown', 'mdown', 'mkd', 'rst', 'rest',
        'adoc', 'asciidoc', 'org', 'tex', 'log', 'nfo', 'rtf'
    ]);
    const PRESENCE_TEXT_FILENAMES = new Set([
        'readme', 'license', 'licence', 'changelog', 'authors',
        'contributors', 'notice', 'copying'
    ]);

    function _t(key) {
        return app.i18n ? app.i18n.t(key) : key;
    }

    function isValidExtension(ext) {
        return validExtensions.has(ext.toLowerCase());
    }

    function getFileTypeLabel(filePath) {
        const name = filePath.split('/').pop().toLowerCase();
        const ext = name.includes('.') ? name.split('.').pop() : '';

        // Check filename-based detection first
        if (FILENAME_MAP[name]) {
            const key = FILENAME_MAP[name];
            return FILENAME_I18N_KEYS.has(key) ? _t(key) : key;
        }

        // Check extension prefix matches (e.g., .env.local)
        for (const [fname, label] of Object.entries(FILENAME_MAP)) {
            if (fname.startsWith('.') && name.startsWith(fname + '.')) {
                return FILENAME_I18N_KEYS.has(label) ? _t(label) : label;
            }
        }

        // Check FILE_TYPES
        const entry = FILE_TYPES[ext];
        if (!entry) {return ext.toUpperCase() || '';}

        if (entry.i18n) {
            const translated = _t(entry.label);
            return entry.labelPrefix ? entry.labelPrefix + translated : translated;
        }
        return entry.label || ext.toUpperCase() || '';
    }

    function getFilePresenceKind(filePath) {
        const name = String(filePath || '').split(/[\\/]/).pop().toLowerCase();
        const ext = name.includes('.') ? name.split('.').pop() : '';
        const baseName = name.includes('.') ? name.slice(0, name.indexOf('.')) : name;
        return PRESENCE_TEXT_EXTENSIONS.has(ext) || PRESENCE_TEXT_FILENAMES.has(baseName) ? 'text' : 'code';
    }

    return {
        FILE_TYPES,
        FILENAME_MAP,
        validExtensions,
        isValidExtension,
        getFileTypeLabel,
        getFilePresenceKind
    };

}
