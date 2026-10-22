import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import 'dart:async';

import 'api_client.dart';
import 'reminders.dart';
import 'prescription_requests.dart';
import 'server_settings.dart';

import 'theme.dart';

const apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://127.0.0.1:3000',
);
const localDemoConnection =
    !kReleaseMode && bool.fromEnvironment('ALLOW_LOCAL_DEMO_HTTP');

class WithYouApp extends StatelessWidget {
  const WithYouApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'WithYou Care',
    debugShowCheckedModeBanner: false,
    theme: withYouTheme(),
    home: const CareHome(),
  );
}

class CareHome extends StatefulWidget {
  const CareHome({super.key});
  @override
  State<CareHome> createState() => _CareHomeState();
}

class _CareHomeState extends State<CareHome> with WidgetsBindingObserver {
  final client = CareApiClient(apiBase);
  final serverSettings = CareServerSettings();
  bool loadingConnection = localDemoConnection;
  final reminders = CareReminders();
  String reminderStatus = 'Care reminders are off.';
  final email = TextEditingController();
  final password = TextEditingController();
  final invitation = TextEditingController();
  final name = TextEditingController();
  final confirmation = TextEditingController();
  bool activating = false;
  bool createInviteAccount = true;
  String? token, error;
  Map<String, dynamic>? workspace;
  bool busy = false, obscure = true;
  bool stale = false;
  DateTime? lastSynced;
  Timer? freshnessTimer;
  bool foreground = true;
  String scheduleFilter = 'Upcoming';
  int tab = 0;
  Future<dynamic> api(String path, [Map<String, dynamic>? body]) async {
    client.token = token;
    try {
      return await client.request(path, body);
    } on CareApiException catch (e) {
      if ((e.status == 401 || e.status == 403) && mounted) {
        setState(() {
          token = null;
          workspace = null;
          password.clear();
        });
        await reminders.disable();
      }
      rethrow;
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (localDemoConnection) unawaited(loadConnection());
    unawaited(
      reminders
          .initialize()
          .then((_) => reminders.disable())
          .catchError((_) {}),
    );
    freshnessTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (foreground && workspace != null && !busy) perform(checkForUpdates);
    });
  }

  Future<void> loadConnection() async {
    try {
      final saved = await serverSettings.load();
      if (saved != null && mounted) client.base = saved;
    } catch (_) {
      // An unavailable preference store must not prevent demo sign-in.
    } finally {
      if (mounted) setState(() => loadingConnection = false);
    }
  }

  Future<void> configureConnection() async {
    final address = TextEditingController(text: client.base);
    String? connectionError;
    bool checking = false;
    final saved = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, update) => AlertDialog(
          title: const Text('Server connection'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Use the address shown on your computer. Keep both devices on the same Wi-Fi.',
                ),
                const SizedBox(height: 16),
                TextField(
                  key: const ValueKey('server-address'),
                  controller: address,
                  keyboardType: TextInputType.url,
                  enabled: !checking,
                  decoration: const InputDecoration(
                    labelText: 'Server address',
                    hintText: 'http://10.170.57.76:3100',
                  ),
                ),
                if (checking)
                  const Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: LinearProgressIndicator(),
                  ),
                if (connectionError != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(connectionError!),
                  ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: checking ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: checking
                  ? null
                  : () async {
                      update(() {
                        checking = true;
                        connectionError = null;
                      });
                      try {
                        final endpoint = normalizeCareServer(address.text);
                        final probe = CareApiClient(endpoint);
                        try {
                          await probe.request('workspace');
                        } on CareApiException catch (e) {
                          if (e.status != 401) {
                            rethrow;
                          }
                        }
                        await serverSettings.save(endpoint);
                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext, endpoint);
                        }
                      } catch (e) {
                        if (dialogContext.mounted) {
                          update(() {
                            checking = false;
                            connectionError =
                                '$e\nCheck the computer address and that the Wi-Fi server is running. If your hotspot blocks connections, connect both devices to another Wi-Fi network.';
                          });
                        }
                      }
                    },
              child: const Text('Save & check connection'),
            ),
          ],
        ),
      ),
    );
    if (saved != null && mounted) {
      setState(() {
        client.base = saved;
        client.token = null;
        token = null;
        error = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Server connected. You can sign in now.')),
      );
    }
    // The dialog's closing animation may still reference its controller.
    await Future<void>.delayed(const Duration(milliseconds: 300));
    address.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    foreground = state == AppLifecycleState.resumed;
    if (state == AppLifecycleState.resumed && workspace != null && !busy) {
      perform(checkForUpdates);
    }
  }

  Future<void> perform(Future<void> Function() fn) async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await fn();
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString().replaceFirst('Exception: ', '');
          if (workspace != null) stale = true;
        });
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> refresh() async {
    final data = await api('workspace') as Map<String, dynamic>;
    if (data['member']['role'] != 'patient') {
      throw Exception('Use an authorized patient account.');
    }
    if (mounted) {
      setState(() {
        workspace = data;
        stale = false;
        lastSynced = DateTime.now().toUtc().add(
          const Duration(hours: 5, minutes: 30),
        );
      });
    }
    if (reminders.enabled) {
      try {
        final count = await reminders.replaceSchedule(data['tasks'] as List);
        if (mounted) {
          setState(
            () => reminderStatus =
                '$count reminders scheduled in the next 24 hours. Android may delay alerts.',
          );
        }
      } catch (_) {
        if (mounted) {
          setState(
            () => reminderStatus = 'Reminder scheduling needs attention. Your approved records remain available.',
          );
        }
      }
    }
  }

  Future<void> checkForUpdates() async {
    final current = await api('care/version');
    final patient = (workspace!['patients'] as List).firstOrNull;
    if (patient == null ||
        stale ||
        current['version'] != (patient['publishedVersion'] ?? 0) ||
        current['activityRevision'] != (patient['activityRevision'] ?? 0)) {
      await refresh();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    freshnessTimer?.cancel();
    email.dispose();
    password.dispose();
    invitation.dispose();
    name.dispose();
    confirmation.dispose();
    super.dispose();
  }

  Widget notice(String text, {bool warning = false}) => Container(
    width: double.infinity,
    margin: const EdgeInsets.symmetric(vertical: 12),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: warning ? const Color(0xFFFFF1D8) : WithYouColors.mint,
      borderRadius: BorderRadius.circular(12),
    ),
    child: Text(
      text,
      style: TextStyle(
        color: warning ? WithYouColors.warning : WithYouColors.deep,
      ),
    ),
  );
  Widget empty(String title, String text, IconData icon) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 40),
    child: Column(
      children: [
        Icon(icon, color: WithYouColors.primary, size: 38),
        const SizedBox(height: 20),
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(text, textAlign: TextAlign.center),
      ],
    ),
  );
  String readableDate(String value) {
    final date = DateTime.tryParse(value);
    if (date == null) return value;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  void showTask(dynamic task) => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (sheet) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.medication_outlined,
                color: WithYouColors.primary,
                size: 32,
              ),
              const SizedBox(height: 16),
              Text(
                task['title'],
                style: Theme.of(sheet).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text(task['instruction']),
              const SizedBox(height: 16),
              Text(
                'Scheduled ${(task['times'] as List).join(', ')} · ${readableDate(task['start'])}',
              ),
              Text('Provider: ${workspace!['organization']['name']}'),
              Text('Approved report version ${task['version']}'),
              const SizedBox(height: 20),
              notice(
                'Follow only the instructions approved by your clinical team. Contact your provider for clarification; WithYou does not change doses or timing.',
              ),
              FilledButton(
                onPressed: () {
                  Navigator.pop(sheet);
                  final reports = (workspace!['reports'] as List).where(
                    (r) => r['id'] == task['reportId'],
                  );
                  if (reports.isNotEmpty) showReport(reports.first);
                },
                child: const Text('View source report'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  @override
  Widget build(BuildContext context) {
    final loggedIn = workspace != null;
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.asset(
                'assets/WithYou_logo.png',
                width: 54,
                height: 36,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 10),
            const Text('WithYou Care'),
          ],
        ),
        actions: loggedIn
            ? [
                IconButton(
                  tooltip: 'Care updates',
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () => showDialog<void>(
                    context: context,
                    builder: (c) => AlertDialog(
                      title: const Text('Care updates'),
                      content: Text(
                        '${(workspace!['reports'] as List).length} approved reports are available.\n${(workspace!['tasks'] as List).where((t) => t['completion'] == 'scheduled').length} scheduled care tasks.\n\n$reminderStatus Pull to refresh your current care plan.',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(c),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  ),
                ),
                IconButton(
                  tooltip: 'Sign out',
                  icon: const Icon(Icons.logout),
                  onPressed: () {
                    setState(() {
                      token = null;
                      workspace = null;
                      client.token = null;
                      password.clear();
                      invitation.clear();
                      tab = 0;
                    });
                    unawaited(reminders.disable().catchError((_) {}));
                  },
                ),
              ]
            : null,
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: RefreshIndicator(
              onRefresh: loggedIn ? () => perform(refresh) : () async {},
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  if (error != null) notice(error!, warning: true),
                  if (stale)
                    notice(
                      'This view may be out of date. Refresh before recording activity.',
                      warning: true,
                    ),
                  if (busy) const LinearProgressIndicator(),
                  if (!loggedIn) ...loginContent() else ...careContent(),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: loggedIn
          ? NavigationBar(
              selectedIndex: tab,
              onDestinationSelected: (i) => setState(() => tab = i),
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.today_outlined),
                  label: 'Today',
                ),
                NavigationDestination(
                  icon: Icon(Icons.calendar_month_outlined),
                  label: 'Schedule',
                ),
                NavigationDestination(
                  icon: Icon(Icons.description_outlined),
                  label: 'Reports',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline),
                  label: 'Profile',
                ),
                NavigationDestination(
                  icon: Icon(Icons.upload_file_outlined),
                  label: 'Requests',
                ),
              ],
            )
          : null,
    );
  }

  List<Widget> loginContent() => [
    const SizedBox(height: 24),
    Text(
      'Your care,\nall in one place.',
      style: Theme.of(context).textTheme.headlineLarge,
    ),
    const SizedBox(height: 18),
    const Text(
      'Your reports, approved tasks and upcoming appointments. One step at a time.',
    ),
    const SizedBox(height: 24),
    if (localDemoConnection) ...[
      Text('Server: ${client.base}'),
      TextButton.icon(
        onPressed: busy || loadingConnection ? null : configureConnection,
        icon: const Icon(Icons.wifi),
        label: const Text('Connection settings'),
      ),
      const SizedBox(height: 12),
    ],
    Wrap(
      spacing: 8,
      children: [
        ChoiceChip(
          label: const Text('Existing account'),
          selected: !activating,
          onSelected: (_) => setState(() => activating = false),
        ),
        ChoiceChip(
          label: const Text('Activate invitation'),
          selected: activating,
          onSelected: (_) => setState(() => activating = true),
        ),
      ],
    ),
    const SizedBox(height: 24),
    if (activating) ...[
      TextField(
        controller: invitation,
        decoration: const InputDecoration(labelText: 'Secure invitation link'),
      ),
      const SizedBox(height: 18),
      if (createInviteAccount)
        TextField(
          controller: name,
          decoration: const InputDecoration(labelText: 'Your full name'),
        ),
      const SizedBox(height: 18),
    ],
    TextField(
      controller: email,
      keyboardType: TextInputType.emailAddress,
      decoration: const InputDecoration(labelText: 'Email address'),
    ),
    const SizedBox(height: 18),
    TextField(
      controller: password,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: 'Password',
        suffixIcon: IconButton(
          tooltip: obscure ? 'Show password' : 'Hide password',
          icon: Icon(
            obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
          onPressed: () => setState(() => obscure = !obscure),
        ),
      ),
    ),
    const SizedBox(height: 24),
    if (activating && createInviteAccount) ...[
      TextField(
        controller: confirmation,
        obscureText: true,
        decoration: const InputDecoration(
          labelText: 'Confirm password',
          helperText: '12+ characters with uppercase, lowercase and a number.',
        ),
      ),
      const SizedBox(height: 24),
    ],
    FilledButton(
      onPressed: busy || loadingConnection
          ? null
          : () => perform(() async {
              Map<String, dynamic>? invite;
              if (activating) {
                final uri = Uri.tryParse(invitation.text.trim());
                if (uri == null ||
                    (uri.host != Uri.parse(client.base).host &&
                        !((Uri.parse(client.base).host == '10.0.2.2' ||
                                (!const bool.fromEnvironment(
                                      'dart.vm.product',
                                    ) &&
                                    const bool.fromEnvironment(
                                      'ALLOW_LOCAL_DEMO_HTTP',
                                    ))) &&
                            ['127.0.0.1', 'localhost'].contains(uri.host))) ||
                    uri.queryParameters['kind'] == 'staff' ||
                    uri.queryParameters['token'] == null ||
                    uri.queryParameters['tenant'] == null) {
                  throw Exception(
                    'Use the patient invitation from your provider.',
                  );
                }
                if (createInviteAccount && password.text != confirmation.text) {
                  throw Exception('Passwords do not match.');
                }
                invite = {
                  'token': uri.queryParameters['token'],
                  'tenantId': uri.queryParameters['tenant'],
                  'kind': 'patient',
                };
                if (createInviteAccount) {
                  final created = await api('invitation-account', {
                    ...invite,
                    'email': email.text.trim(),
                    'name': name.text.trim(),
                    'password': password.text,
                  });
                  if (created['emailVerificationRequired'] == true) {
                    setState(() => createInviteAccount = false);
                    throw Exception(
                      'Account created. Verify your email, then sign in here to connect your care.',
                    );
                  }
                }
              }
              final session = await api('session', {
                'email': email.text.trim(),
                'password': password.text,
              });
              token = session['token'];
              if (invite != null) await api('invitation-accept', invite);
              await refresh();
              password.clear();
            }),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Text(
          activating
              ? createInviteAccount
                    ? 'Create account & connect care'
                    : 'Sign in & connect care'
              : 'Sign in',
        ),
      ),
    ),
    TextButton(
      onPressed: busy
          ? null
          : () => perform(() async {
              final result = await api('password-reset', {
                'email': email.text.trim(),
              });
              if (mounted) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text(result['message'])));
              }
            }),
      child: const Text('Forgot password?'),
    ),
    const SizedBox(height: 20),
    if (activating)
      TextButton(
        onPressed: () =>
            setState(() => createInviteAccount = !createInviteAccount),
        child: Text(
          createInviteAccount
              ? 'Already have an account? Connect it'
              : 'Create a new account',
        ),
      ),
    const Text(
      'Medical information is available only after authentication. Passwords and tokens are not saved on the device.',
    ),
  ];
  List<Widget> careContent() {
    if (tab == 4) {
      client.token = token;
      return [
        PrescriptionRequests(
          key: const ValueKey('prescription-requests'),
          client: client,
          request: api,
          activityRevision:
              ((workspace!['patients'] as List)
                          .firstOrNull?['activityRevision'] ??
                      0)
                  as int,
        ),
      ];
    }
    final patients = workspace!['patients'] as List;
    final patient = patients.isEmpty ? null : patients.first;
    final now = DateTime.now().toUtc().add(
      const Duration(hours: 5, minutes: 30),
    );
    final date =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final tasks = (workspace!['tasks'] as List)
        .where(
          (t) =>
              (tab == 1 &&
                  (scheduleFilter == 'History'
                      ? t['start'].compareTo(date) < 0
                      : scheduleFilter == 'Upcoming'
                      ? t['start'].compareTo(date) >= 0
                      : t['start'] == date)) ||
              (tab == 0 &&
                  (t['start'].compareTo(date) <= 0 &&
                      t['end'].compareTo(date) >= 0)),
        )
        .toList();
    tasks.sort(
      (a, b) => '${a['start']} ${(a['times'] as List).firstOrNull ?? ''}'
          .compareTo('${b['start']} ${(b['times'] as List).firstOrNull ?? ''}'),
    );
    final done = tasks.where((t) => t['completion'] == 'completed').length;
    final followUps =
        (workspace!['tasks'] as List)
            .where(
              (t) =>
                  t['type'] == 'follow-up' &&
                  t['start'].compareTo(date) >= 0 &&
                  t['completion'] == 'scheduled',
            )
            .toList()
          ..sort(
            (a, b) => '${a['start']} ${a['times']}'.compareTo(
              '${b['start']} ${b['times']}',
            ),
          );
    final reports = workspace!['reports'] as List;
    if (tab == 3) {
      return [
        Text(
          'Your care profile.',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 20),
        Text(patient?['name'] ?? 'Verified patient'),
        Text('Provider: ${workspace!['organization']['name']}'),
        const Text('Time zone: Asia/Kolkata'),
        if (lastSynced != null)
          Text(
            'Last refreshed ${lastSynced!.hour.toString().padLeft(2, '0')}:${lastSynced!.minute.toString().padLeft(2, '0')}',
          ),
        const SizedBox(height: 20),
        const ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.lock_outline, color: WithYouColors.primary),
          title: Text('Private by default'),
          subtitle: Text(
            'Records and passwords are not saved to device storage. Sign out on shared devices.',
          ),
        ),
        notice(
          'Your records are shared by your connected provider. Caregiver access requires separate authorization.',
        ),
        Text('Care reminders', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        Text(
          reminders.supported
              ? 'Optional Android reminders use approved task times for the next 24 hours. Lock-screen messages contain no medicine or diagnosis. They refresh when you reconnect; timing is not guaranteed.'
              : 'Device reminders are available in the Android app. Your reports remain available without notification permission.',
        ),
        if (reminders.supported) ...[
          const SizedBox(height: 12),
          FilledButton(
            onPressed: busy
                ? null
                : () => perform(() async {
                    if (reminders.enabled) {
                      await reminders.disable();
                      setState(
                        () => reminderStatus = 'Care reminders are off.',
                      );
                    } else {
                      if (!await reminders.enable()) {
                        setState(
                          () => reminderStatus = 'Notification permission was not granted. Reports and tasks remain available.',
                        );
                        return;
                      }
                      await refresh();
                      await reminders.confirmation();
                    }
                  }),
            child: Text(
              reminders.enabled
                  ? 'Turn off care reminders'
                  : 'Enable care reminders',
            ),
          ),
          notice(reminderStatus),
        ],
        const SizedBox(height: 24),
        TextField(
          controller: invitation,
          decoration: const InputDecoration(
            labelText: 'Secure invitation link',
          ),
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: busy
              ? null
              : () => perform(() async {
                  final uri = Uri.parse(invitation.text.trim());
                  await api('invitation-accept', {
                    'token': uri.queryParameters['token'],
                    'tenantId': uri.queryParameters['tenant'],
                    'kind': 'patient',
                  });
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Invitation verified and claimed.'),
                      ),
                    );
                  }
                  await refresh();
                }),
          child: const Text('Verify & claim invitation'),
        ),
      ];
    }
    if (tab == 2) {
      final reports = workspace!['reports'] as List;
      return [
        Text(
          'Your medical reports.',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 24),
        if (reports.isEmpty)
          empty(
            'No published reports yet.',
            'Only approved reports are shared with you.',
            Icons.description_outlined,
          ),
        ...reports.map<Widget>(
          (r) => Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.verified_outlined,
                        color: WithYouColors.primary,
                      ),
                      SizedBox(width: 8),
                      Text('Clinician approved'),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Consultation report · v${r['version']}',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(workspace!['organization']['name']),
                  const SizedBox(height: 14),
                  OutlinedButton(
                    onPressed: () => showReport(r),
                    child: const Text('View approved report'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ];
    }
    return [
      Text(
        'Hello, ${patient?['name'] ?? 'there'}.',
        style: Theme.of(context).textTheme.headlineMedium,
      ),
      const SizedBox(height: 8),
      Text('${readableDate(date)} · A little care. Every day.'),
      if (tab == 1)
        Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Wrap(
            spacing: 8,
            children: ['Upcoming', 'Today', 'History']
                .map(
                  (filter) => ChoiceChip(
                    label: Text(filter),
                    selected: scheduleFilter == filter,
                    onSelected: (_) => setState(() => scheduleFilter = filter),
                  ),
                )
                .toList(),
          ),
        ),
      const SizedBox(height: 24),
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: WithYouColors.mint,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tab == 0 ? 'Today’s care' : 'Approved schedule',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Text('$done of ${tasks.length} completed'),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: tasks.isEmpty ? 0 : done / tasks.length,
              borderRadius: BorderRadius.circular(8),
            ),
            const SizedBox(height: 12),
            const Text(
              'Completion is your self-report, not clinical verification.',
            ),
          ],
        ),
      ),
      const SizedBox(height: 24),
      const SizedBox(height: 12),
      const Text('All times in Asia/Kolkata'),
      if (tasks.isEmpty)
        empty(
          'No approved tasks scheduled.',
          'Your provider will review and publish your care plan.',
          Icons.event_available_outlined,
        ),
      ...tasks.map<Widget>(
        (t) => Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      (t['times'] as List).join(', '),
                      style: Theme.of(context).textTheme.titleLarge
                          ?.copyWith(color: WithYouColors.primary),
                    ),
                    const Spacer(),
                    Chip(
                      avatar: Icon(
                        t['completion'] == 'completed'
                            ? Icons.check_circle_outline
                            : t['completion'] == 'skipped'
                            ? Icons.remove_circle_outline
                            : Icons.schedule,
                        size: 16,
                      ),
                      label: Text(
                        t['completion'] == 'completed'
                            ? 'Completed'
                            : t['completion'] == 'skipped'
                            ? 'Skipped'
                            : 'Scheduled',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(t['title'], style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(t['instruction']),
                const SizedBox(height: 12),
                Text('${readableDate(t['start'])} · Approved v${t['version']}'),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton(
                      onPressed: busy || stale || t['completion'] == 'completed'
                          ? null
                          : () => updateTask(t['id'], 'completed'),
                      child: const Text('Complete'),
                    ),
                    OutlinedButton(
                      onPressed: busy || stale || t['completion'] == 'skipped'
                          ? null
                          : () => updateTask(
                              t['id'],
                              t['completion'] == 'completed'
                                  ? 'scheduled'
                                  : 'skipped',
                            ),
                      child: Text(
                        t['completion'] == 'completed' ? 'Undo' : 'Skip',
                      ),
                    ),
                    TextButton(
                      onPressed: () => showTask(t),
                      child: const Text('Task details'),
                    ),
                    TextButton(
                      onPressed: () {
                        final matching = (workspace!['reports'] as List).where(
                          (r) => r['id'] == t['reportId'],
                        );
                        if (matching.isNotEmpty) showReport(matching.first);
                      },
                      child: const Text('View source report'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
      if (tab == 0 && followUps.isNotEmpty)
        Card(
          child: ListTile(
            contentPadding: const EdgeInsets.all(20),
            leading: const Icon(
              Icons.event_available_outlined,
              color: WithYouColors.primary,
              size: 30,
            ),
            title: const Text('Your next appointment'),
            subtitle: Text(
              '${readableDate(followUps.first['start'])} · ${(followUps.first['times'] as List).join(', ')}\n${followUps.first['instruction']}',
            ),
            onTap: () => showTask(followUps.first),
          ),
        ),
      if (tab == 0 && reports.isNotEmpty)
        Card(
          child: ListTile(
            contentPadding: const EdgeInsets.all(20),
            leading: const Icon(
              Icons.description_outlined,
              color: WithYouColors.primary,
              size: 30,
            ),
            title: const Text('Latest approved report'),
            subtitle: Text(
              '${workspace!['organization']['name']} · Version ${reports.last['version']}',
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => showReport(reports.last),
          ),
        ),
    ];
  }

  void updateTask(String id, String completion) => perform(() async {
    await api('tasks/$id', {'completion': completion});
    await refresh();
  });
  void showReport(dynamic report) => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (c) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: SizedBox(
          height: MediaQuery.sizeOf(c).height * .75,
          child: ListView(
            children: [
              Text(
                'Approved report · v${report['version']}',
                style: Theme.of(c).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text(
                'Approved by ${report['approvedByName'] ?? 'your clinician'}\n${readableDate(report['approvedAt'] ?? '')}',
              ),
              const SizedBox(height: 20),
              ...(report['candidates'] as List)
                  .where((t) => t['status'] == 'approved')
                  .map<Widget>(
                    (t) => Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t['title'],
                            style: Theme.of(c).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(t['instruction']),
                          const SizedBox(height: 8),
                          Text(
                            '${t['start']} → ${t['end']} · ${(t['times'] as List).join(', ')}',
                          ),
                          const SizedBox(height: 8),
                          Text('Source: ${t['source']}'),
                        ],
                      ),
                    ),
                  ),
              notice(
                'These instructions were approved by your provider. Contact your clinical team if anything is unclear.',
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
