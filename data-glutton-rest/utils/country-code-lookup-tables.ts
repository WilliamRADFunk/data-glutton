const isoCodeToDataCodeTable: { [key: string]: string } = {
    AD: 'an',
    AG: 'ac',
    AI: 'av',
    AQ: 'ay',
    AS: 'aq',
    AT: 'au',
    AU: 'as',
    AW: 'aa',
    AZ: 'aj',
    BA: 'bk',
    BD: 'bg',
    BF: 'uv',
    BG: 'bu',
    BH: 'ba',
    BI: 'by',
    BJ: 'bn',
    BL: 'tb',
    BM: 'bd',
    BN: 'bx',
    BO: 'bl',
    BS: 'bf',
    BW: 'bc',
    BY: 'bo',
    BZ: 'bh',
    CC: 'ck',
    CD: 'cg',
    CF: 'ct',
    CG: 'cf',
    CH: 'sz',
    CI: 'iv',
    CK: 'cw',
    CL: 'ci',
    CN: 'ch',
    CR: 'cs',
    CW: 'uc',
    CX: 'kt',
    CZ: 'ez',
    DE: 'gm',
    DK: 'da',
    DM: 'do',
    DO: 'dr',
    DZ: 'ag',
    EE: 'en',
    EH: 'wi',
    ES: 'sp',
    GA: 'gb',
    GB: 'uk',
    GD: 'gj',
    GE: 'gg',
    GF: 'fr',
    GG: 'gk',
    GM: 'ga',
    GN: 'gv',
    GP: 'fr',
    GQ: 'ek',
    GS: 'sx',
    GU: 'gq',
    GW: 'pu',
    HN: 'ho',
    HT: 'ha',
    IE: 'ei',
    IL: 'is',
    IQ: 'iz',
    IS: 'ic',
    JP: 'ja',
    KH: 'cb',
    KI: 'kr',
    KM: 'cn',
    KN: 'sc',
    KP: 'kn',
    KR: 'ks',
    KW: 'ku',
    KY: 'cj',
    LB: 'le',
    LC: 'st',
    LI: 'ls',
    LK: 'ce',
    LR: 'li',
    LS: 'lt',
    LT: 'lh',
    LV: 'lg',
    MA: 'mo',
    MC: 'mn',
    ME: 'mj',
    MF: 'rn',
    MG: 'ma',
    MH: 'rm',
    MM: 'bm',
    MN: 'mg',
    MO: 'mc',
    MP: 'cq',
    MQ: 'fr',
    MS: 'mh',
    MU: 'mp',
    MW: 'mi',
    NA: 'wa',
    NE: 'ng',
    NG: 'ni',
    NI: 'nu',
    NU: 'ne',
    OM: 'mu',
    PA: 'pm',
    PF: 'fp',
    PG: 'pp',
    PH: 'rp',
    PM: 'sb',
    PN: 'pc',
    PR: 'rq',
    PS: 'we',
    PT: 'po',
    PW: 'ps',
    PY: 'pa',
    RE: 'fr',
    RS: 'ri',
    RU: 'rs',
    SB: 'bp',
    SC: 'se',
    SD: 'su',
    SE: 'sw',
    SG: 'sn',
    SJ: 'sv',
    SK: 'lo',
    SN: 'sg',
    SR: 'ns',
    SS: 'od',
    ST: 'tp',
    SV: 'es',
    SX: 'nn',
    SZ: 'wz',
    TC: 'tk',
    TD: 'cd',
    TF: 'fs',
    TG: 'to',
    TJ: 'ti',
    TK: 'tl',
    TL: 'tt',
    TM: 'tx',
    TN: 'ts',
    TO: 'tn',
    TR: 'tu',
    TT: 'td',
    UA: 'up',
    VA: 'vt',
    VG: 'vi',
    VI: 'vq',
    VN: 'vm',
    VU: 'nh',
    XK: 'kv',
    YE: 'ym',
    YT: 'fr',
    ZA: 'sf',
    ZM: 'za',
    ZW: 'zi',
    ad: 'an',
    ag: 'ac',
    ai: 'av',
    aq: 'ay',
    as: 'aq',
    at: 'au',
    au: 'as',
    aw: 'aa',
    az: 'aj',
    ba: 'bk',
    bd: 'bg',
    bf: 'uv',
    bg: 'bu',
    bh: 'ba',
    bi: 'by',
    bj: 'bn',
    bl: 'tb',
    bm: 'bd',
    bn: 'bx',
    bo: 'bl',
    bs: 'bf',
    bw: 'bc',
    by: 'bo',
    bz: 'bh',
    cc: 'ck',
    cd: 'cg',
    cf: 'ct',
    cg: 'cf',
    ch: 'sz',
    ci: 'iv',
    ck: 'cw',
    cl: 'ci',
    cn: 'ch',
    cr: 'cs',
    cw: 'uc',
    cx: 'kt',
    cz: 'ez',
    de: 'gm',
    dk: 'da',
    dm: 'do',
    do: 'dr',
    dz: 'ag',
    ee: 'en',
    eh: 'wi',
    es: 'sp',
    ga: 'gb',
    gb: 'uk',
    gd: 'gj',
    ge: 'gg',
    gf: 'fr',
    gg: 'gk',
    gm: 'ga',
    gn: 'gv',
    gp: 'fr',
    gq: 'ek',
    gs: 'sx',
    gu: 'gq',
    gw: 'pu',
    hn: 'ho',
    ht: 'ha',
    ie: 'ei',
    il: 'is',
    iq: 'iz',
    is: 'ic',
    jp: 'ja',
    kh: 'cb',
    ki: 'kr',
    km: 'cn',
    kn: 'sc',
    kp: 'kn',
    kr: 'ks',
    kw: 'ku',
    ky: 'cj',
    lb: 'le',
    lc: 'st',
    li: 'ls',
    lk: 'ce',
    lr: 'li',
    ls: 'lt',
    lt: 'lh',
    lv: 'lg',
    ma: 'mo',
    mc: 'mn',
    me: 'mj',
    mf: 'rn',
    mg: 'ma',
    mh: 'rm',
    mm: 'bm',
    mn: 'mg',
    mo: 'mc',
    mp: 'cq',
    mq: 'fr',
    ms: 'mh',
    mu: 'mp',
    mw: 'mi',
    na: 'wa',
    ne: 'ng',
    ng: 'ni',
    ni: 'nu',
    nu: 'ne',
    om: 'mu',
    pa: 'pm',
    pf: 'fp',
    pg: 'pp',
    ph: 'rp',
    pm: 'sb',
    pn: 'pc',
    pr: 'rq',
    ps: 'we',
    pt: 'po',
    pw: 'ps',
    py: 'pa',
    re: 'fr',
    rs: 'ri',
    ru: 'rs',
    sb: 'bp',
    sc: 'se',
    sd: 'su',
    se: 'sw',
    sg: 'sn',
    sj: 'sv',
    sk: 'lo',
    sn: 'sg',
    sr: 'ns',
    ss: 'od',
    st: 'tp',
    sv: 'es',
    sx: 'nn',
    sz: 'wz',
    tc: 'tk',
    td: 'cd',
    tf: 'fs',
    tg: 'to',
    tj: 'ti',
    tk: 'tl',
    tl: 'tt',
    tm: 'tx',
    tn: 'ts',
    to: 'tn',
    tr: 'tu',
    tt: 'td',
    ua: 'up',
    va: 'vt',
    vg: 'vi',
    vi: 'vq',
    vn: 'vm',
    vu: 'nh',
    xk: 'kv',
    ye: 'ym',
    yt: 'fr',
    za: 'sf',
    zm: 'za',
    zw: 'zi'
};

const dataCodeToIsoCodeTable: { [key: string]: string } = {
    aa: 'aw',
    ac: 'ag',
    ag: 'dz',
    aj: 'az',
    an: 'ad',
    aq: 'as',
    as: 'au',
    au: 'at',
    av: 'ai',
    ay: 'aq',
    ba: 'bh',
    bc: 'bw',
    bd: 'bm',
    bf: 'bs',
    bg: 'bd',
    bh: 'bz',
    bk: 'ba',
    bl: 'bo',
    bm: 'mm',
    bn: 'bj',
    bo: 'by',
    bp: 'sb',
    bu: 'bg',
    bx: 'bn',
    by: 'bi',
    cb: 'kh',
    cd: 'td',
    ce: 'lk',
    cf: 'cg',
    cg: 'cd',
    ch: 'cn',
    ci: 'cl',
    cj: 'ky',
    ck: 'cc',
    cn: 'km',
    cq: 'mp',
    cs: 'cr',
    ct: 'cf',
    cw: 'ck',
    da: 'dk',
    do: 'dm',
    dr: 'do',
    ei: 'ie',
    ek: 'gq',
    en: 'ee',
    es: 'sv',
    ez: 'cz',
    fg: 'gf',
    fp: 'pf',
    fs: 'tf',
    ga: 'gm',
    gb: 'ga',
    gg: 'ge',
    gj: 'gd',
    gk: 'gg',
    gm: 'de',
    gq: 'gu',
    gv: 'gn',
    gz: 'ps',
    ha: 'ht',
    ho: 'hn',
    ic: 'is',
    is: 'il',
    iv: 'ci',
    iz: 'iq',
    ja: 'jp',
    kn: 'kp',
    kr: 'ki',
    ks: 'kr',
    kt: 'cx',
    ku: 'kw',
    kv: 'xk',
    le: 'lb',
    lg: 'lv',
    lh: 'lt',
    li: 'lr',
    lo: 'sk',
    ls: 'li',
    lt: 'ls',
    ma: 'mg',
    mb: 'mq',
    mc: 'mo',
    mf: 'yt',
    mg: 'mn',
    mh: 'ms',
    mi: 'mw',
    mj: 'me',
    mn: 'mc',
    mo: 'ma',
    mp: 'mu',
    mu: 'om',
    ne: 'nu',
    ng: 'ne',
    nh: 'vu',
    ni: 'ng',
    nn: 'sx',
    ns: 'sr',
    nu: 'ni',
    od: 'ss',
    pa: 'py',
    pc: 'pn',
    pm: 'pa',
    po: 'pt',
    pp: 'pg',
    ps: 'pw',
    pu: 'gw',
    ri: 'rs',
    rm: 'mh',
    rn: 'mf',
    rp: 'ph',
    rq: 'pr',
    rs: 'ru',
    sb: 'pm',
    sc: 'kn',
    se: 'sc',
    sf: 'za',
    sg: 'sn',
    sn: 'sg',
    sp: 'es',
    st: 'lc',
    su: 'sd',
    sv: 'sj',
    sw: 'se',
    sx: 'gs',
    sz: 'ch',
    tb: 'bl',
    td: 'tt',
    ti: 'tj',
    tk: 'tc',
    tl: 'tk',
    tn: 'to',
    to: 'tg',
    tp: 'st',
    ts: 'tn',
    tt: 'tl',
    tu: 'tr',
    tx: 'tm',
    uc: 'cw',
    uk: 'gb',
    up: 'ua',
    uv: 'bf',
    vi: 'vg',
    vm: 'vn',
    vq: 'vi',
    vt: 'va',
    wa: 'na',
    we: 'ps',
    wi: 'eh',
    wz: 'sz',
    ym: 'ye',
    za: 'zm',
    zi: 'zw'
};

export function dataCodeToIsoCode(dataCode: string): string {
    return dataCodeToIsoCodeTable[dataCode] || dataCode;
}

export function isoCodeToDataCode(iso: string): string {
    return isoCodeToDataCodeTable[iso] || iso.toLowerCase();
}
