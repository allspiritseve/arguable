require('proof')(19, prove)

function prove (assert) {
    var pattern = [
        { terse: 'a', verbose: 'ambiguous' },
        { terse: 'A', verbose: 'arbitrary' },
        { terse: 'N', verbose: 'name', arguable: true },
        { terse: 'p', verbose: 'processes', arguable: true },
        { terse: 'c', verbose: 'config', arguable: true },
        { verbose: 'help', arguable: false }
    ]
    var getopt = require('../getopt'), params
    var given = getopt(pattern, [ '-N', 'steve']).given
    assert(given, [ 'name' ], 'string given')
    var params = getopt(pattern, [ '-N', 'steve']).params
    assert(params, { processes: [], config: [], name: [ 'steve' ] }, 'terse string')
    params = getopt(pattern, [ '-Nsteve']).params
    assert(params.name, [ 'steve' ], 'terse mushed string')
    params = getopt(pattern, [ '--name', 'steve']).params
    assert(params.name, [ 'steve' ], 'verbose string')
    params = getopt(pattern, [ '--n', 'steve']).params
    assert(params.name, [ 'steve' ], 'verbose abbrevated string')
    params = getopt(pattern, [ '--name=steve']).params
    assert(params.name, [ 'steve' ], 'verbose assigned string')

    params = getopt(pattern, [ '-a', 3 ]).params
    assert(params.ambiguous, [ true ], 'short opt makes it unambigouus')
    params = getopt(pattern, [ '-A', 3 ]).params
    assert(params.arbitrary, [ true ], 'short opt match')
    assert(!('ambiguous' in params), 'boolean not added')

    getopt(pattern, [ '-aA' ])

    params = getopt(pattern, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ]).params
    assert(params.config, [ 'one=1', 'two=2', 'three=3' ], 'array')

    var argv = [ '-p', 3, '--', '-A' ]
    var outcome = getopt(pattern, argv)
    assert(argv, [ '-A' ], 'stop on double hyphens')
    assert(outcome.terminal, 'detect terminal')
    assert(outcome.params.processes, [ '3' ], 'stop on double hyphens params')

    var argv = [ '-a', '-p', 3 ]
    assert(getopt(pattern, argv).ordered, [
        { name: 'ambiguous', value: true },
        { name: 'processes', value: '3' }
    ], 'ordered')

    function failed (args, expected, message) {
        var outcome = getopt(pattern, args)
        assert(outcome.abend, expected, message)
    }

    failed([ '-ax' ], 'unknown argument', 'unknown')
    failed([ '-c' ], 'missing argument', 'terse missing')
//    failed([ '--p', 2, '--p', 3 ], 'scalar argument', 'duplicate argument')
    failed([ '--c' ], 'missing argument', 'verbose inferred missing')
    failed([ '--a' ], 'ambiguous argument', 'ambiguous')
    failed([ '--ambiguous=1' ], 'unexpected argument value', 'value to long toggle')
}
