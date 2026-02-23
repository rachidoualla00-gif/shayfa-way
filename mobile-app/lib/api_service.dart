import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://your-server-ip:5000/api";

  static Future<List<dynamic>> fetchPDFs() async {
    final response = await http.get(Uri.parse("$baseUrl/quran/pdfs"));

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load PDFs');
    }
  }

  static Future<void> saveProgress(String pdfId, int page) async {
    // API call to save reading progress per user
    await http.post(
      Uri.parse("$baseUrl/user/tracker"),
      body: json.encode({'pdfId': pdfId, 'page': page}),
      headers: {'Content-Type': 'application/json'},
    );
  }
}
