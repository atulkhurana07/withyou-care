import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

import 'api_client.dart';
import 'theme.dart';

class PrescriptionRequests extends StatefulWidget {
  final CareApiClient client;
  final int activityRevision;
  final Future<dynamic> Function(String, [Map<String, dynamic>?]) request;
  const PrescriptionRequests({
    super.key,
    required this.client,
    required this.request,
    this.activityRevision = 0,
  });
  @override
  State<PrescriptionRequests> createState() => _PrescriptionRequestsState();
}

class _PrescriptionRequestsState extends State<PrescriptionRequests> {
  List<dynamic> items = [];
  bool busy = false, consent = false, belongs = false;
  String? error, message;
  PlatformFile? selected;
  String? replacementId;
  @override
  void initState() {
    super.initState();
    load();
  }

  @override
  void didUpdateWidget(covariant PrescriptionRequests oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activityRevision != widget.activityRevision && !busy) load();
  }

  Future<void> run(Future<void> Function() action) async {
    if (busy) return;
    setState(() {
      busy = true;
      error = null;
      message = null;
    });
    try {
      await action();
    } catch (e) {
      if (e is CareApiException && [401, 403].contains(e.status)) {
        try {
          await widget.request('care/version');
        } catch (_) {}
      }
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> load() async {
    try {
      final result = await widget.request('intake/list');
      if (mounted) setState(() => items = result['items']);
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  String label(String state) =>
      const {
        'awaiting_review': 'Awaiting clinician review',
        'awaiting_patient': 'Your confirmation needed',
        'clarification_requested': 'Clarification needed',
        'ready_to_book': 'Ready to request an appointment',
        'booking_requested': 'Appointment requested',
        'confirmed': 'Appointment confirmed',
        'cancelled': 'Cancelled',
        'replaced': 'Replaced by a clearer document',
      }[state] ??
      state;
  String localDate(String text) {
    final date = DateTime.parse(text)
        .toUtc()
        .add(const Duration(hours: 5, minutes: 30));
    return '${date.day}/${date.month}/${date.year} · ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} IST';
  }

  Future<void> respond(dynamic item, bool correct) async {
    final comment = TextEditingController();
    final approved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          correct
              ? 'Confirm the reading'
              : 'Tell your clinician what is unclear',
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Confirming the reading does not verify medicine safety or authorize a dose change.',
              ),
              TextField(
                controller: comment,
                maxLength: 2000,
                minLines: 2,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Comment / unclear details',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Back'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Send response'),
          ),
        ],
      ),
    );
    final text = comment.text;
    // Dispose after the closing dialog finishes using the controller.
    await Future<void>.delayed(const Duration(milliseconds: 250));
    comment.dispose();
    if (approved == true) {
      await run(() async {
        await widget.request('intake/${item['id']}/patient-response', {
          'revision': item['revision'],
          'correct': correct,
          'comment': text,
        });
        await load();
      });
    }
  }

  Future<void> book(dynamic item) async {
    final now = DateTime.now().toUtc().add(
      const Duration(hours: 5, minutes: 30),
    );
    final date = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 59)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 10, minute: 0),
    );
    if (time == null || !mounted) return;
    final preferred = DateTime.utc(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    ).subtract(const Duration(hours: 5, minutes: 30));
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request an appointment'),
        content: Text(
          '${localDate(preferred.toIso8601String())}\n\nThis is your preferred time. Clinic staff will allocate and confirm a slot. Please confirm your clinic has your current contact details.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Back'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Contact details correct · request'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await run(() async {
        await widget.request('intake/${item['id']}/book', {
          'revision': item['revision'],
          'preferredAt': preferred.toIso8601String(),
          'reason': '',
          'contactConfirmed': true,
        });
        await load();
      });
    }
  }

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(
        'Prescriptions & appointments',
        style: Theme.of(context).textTheme.headlineMedium,
      ),
      const SizedBox(height: 12),
      const Text(
        'Upload → clinician review → your confirmation → appointment request → clinic confirmation',
      ),
      const SizedBox(height: 20),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(
                Icons.upload_file_outlined,
                size: 36,
                color: WithYouColors.primary,
              ),
              const SizedBox(height: 12),
              Text(
                'Share a prescription',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              const Text(
                'JPEG, PNG or PDF · up to 8 MB · PDF up to 10 pages. Include every page, patient name and dates. Use a well-lit, sharp image with no cropped instructions.',
              ),
              const SizedBox(height: 12),
              if (replacementId != null)
                Text(
                  'Replacement selected. Choose the clearer document, then confirm consent and submit.',
                ),
              OutlinedButton.icon(
                onPressed: busy
                    ? null
                    : () => run(() async {
                        final file = await FilePicker.pickFile(
                          type: FileType.custom,
                          allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
                        );
                        if (file == null) return;
                        final size = await file.length();
                        if (size == null ||
                            size == 0 ||
                            size > 8 * 1024 * 1024) {
                          throw CareApiException('Choose a file up to 8 MB.');
                        }
                        if (mounted) setState(() => selected = file);
                      }),
                icon: const Icon(Icons.attach_file),
                label: Text(selected?.name ?? 'Choose photo or PDF'),
              ),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: belongs,
                onChanged: busy
                    ? null
                    : (value) => setState(() => belongs = value ?? false),
                title: const Text('This prescription belongs to me.'),
              ),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: consent,
                onChanged: busy
                    ? null
                    : (value) => setState(() => consent = value ?? false),
                title: const Text(
                  'I consent to my connected clinic reviewing this document.',
                ),
              ),
              FilledButton(
                onPressed: busy || selected == null || !consent || !belongs
                    ? null
                    : () => run(() async {
                        final result = await widget.client.uploadPrescription(
                          await selected!.readAsBytes(),
                          selected!.name,
                          replacementId: replacementId,
                        );
                        await load();
                        if (mounted) {
                          setState(() {
                            message = result['message'];
                            selected = null;
                            replacementId = null;
                            consent = false;
                            belongs = false;
                          });
                        }
                      }),
                child: Text(busy ? 'Working…' : 'Submit for review'),
              ),
              const SizedBox(height: 12),
              const Text(
                'File checks cannot prove a prescription is correct. A clinician must check unclear text, medicines and patient identity. Do not change treatment based on an automated reading.',
              ),
            ],
          ),
        ),
      ),
      if (busy) const LinearProgressIndicator(),
      if (error != null)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(
            error!,
            style: const TextStyle(color: WithYouColors.danger),
          ),
        ),
      if (message != null)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(message!),
        ),
      TextButton.icon(
        onPressed: busy ? null : () => run(load),
        icon: const Icon(Icons.refresh),
        label: const Text('Refresh requests'),
      ),
      if (items.isEmpty && !busy)
        const Padding(
          padding: EdgeInsets.all(20),
          child: Text(
            'Your submitted prescriptions and appointment updates will appear here.',
          ),
        ),
      ...items.map(
        (item) => Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  label(item['state']),
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  '${item['pages']} page(s) · ${localDate(item['createdAt'])}',
                ),
                if ((item['reviewSummary'] ?? '').isNotEmpty) ...[
                  const Divider(),
                  const Text('Clinician’s reading / clarification'),
                  Text(item['reviewSummary']),
                ],
                if (item['state'] == 'awaiting_review')
                  const Text(
                    'Your clinic is checking the original document. No medication plan has been created from this upload.',
                  ),
                if (item['state'] == 'clarification_requested')
                  const Text(
                    'Contact your clinic about the clarification. If a clearer document is needed, choose a replacement above; your original remains in the review history.',
                  ),
                if (item['state'] == 'clarification_requested')
                  OutlinedButton(
                    onPressed: busy
                        ? null
                        : () {
                            setState(() => replacementId = item['id']);
                            Scrollable.ensureVisible(
                              context,
                              duration: const Duration(milliseconds: 250),
                              alignment: 0,
                            );
                          },
                    child: const Text('Upload a clearer replacement'),
                  ),
                if (item['state'] == 'awaiting_patient') ...[
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: busy ? null : () => respond(item, true),
                    child: const Text('The reading matches my prescription'),
                  ),
                  OutlinedButton(
                    onPressed: busy ? null : () => respond(item, false),
                    child: const Text('Something is unclear or incorrect'),
                  ),
                ],
                if (item['state'] == 'ready_to_book')
                  FilledButton(
                    onPressed: busy ? null : () => book(item),
                    child: const Text('Request appointment'),
                  ),
                if (item['preferredAt'] != null)
                  Text('Preferred: ${localDate(item['preferredAt'])}'),
                if (item['state'] == 'booking_requested')
                  const Text(
                    'Request received. Await clinic confirmation before attending.',
                  ),
                if (item['state'] == 'confirmed') ...[
                  const Divider(),
                  Text('Confirmed: ${localDate(item['scheduledAt'])}'),
                  Text(item['location']),
                  const Text(
                    'Confirmation is available here in the app. Contact your clinic for changes.',
                  ),
                ],
                if ([
                  'ready_to_book',
                  'booking_requested',
                  'confirmed',
                ].contains(item['state']))
                  TextButton(
                    onPressed: busy
                        ? null
                        : () async {
                            final cancel = await showDialog<bool>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Cancel this request?'),
                                content: const Text(
                                  'Your document history remains available. The appointment slot will be released.',
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, false),
                                    child: const Text('Keep request'),
                                  ),
                                  FilledButton(
                                    onPressed: () =>
                                        Navigator.pop(context, true),
                                    child: const Text('Cancel request'),
                                  ),
                                ],
                              ),
                            );
                            if (cancel == true) {
                              await run(() async {
                                await widget.request(
                                  'intake/${item['id']}/cancel',
                                  {'revision': item['revision']},
                                );
                                await load();
                              });
                            }
                          },
                    child: const Text('Cancel appointment request'),
                  ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}
