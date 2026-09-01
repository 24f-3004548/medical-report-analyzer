from functools import lru_cache
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup

MEDLINEPLUS_API = "https://wsearch.nlm.nih.gov/ws/query"
HEADERS = {
    "User-Agent": (
        "VerisMedicalReportApp/1.0 "
        "(medical-report-analysis project; "
        "contact: 24f3004548@ds.study.iitm.ac.in)"
    )
}

def clean_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(
        separator=" ",
        strip=True
    )

@lru_cache(maxsize=100)
def fetch_medlineplus(topic: str) -> dict:
    params = {
        "db": "healthTopics",
        "term": topic,
        "retmax": 5,
        "rettype": "brief",
    }
    response = requests.get(
        MEDLINEPLUS_API,
        params=params,
        headers=HEADERS,
        timeout=15,
    )
    response.raise_for_status()
    root = ET.fromstring(response.content)
    documents = root.findall(".//document")
    if not documents:
        return {
            "found": False,
            "topic": topic,
            "results": [],
        }
    results = []
    for document in documents:
        result = {
            "title": None,
            "url": document.attrib.get("url"),
            "summary": None,
            "snippet": None,
            "source": "MedlinePlus",
        }
        for content in document.findall("content"):
            name = content.attrib.get("name")
            text = "".join(
                content.itertext()
            ).strip()
            if name == "title":
                result["title"] = clean_html(text)
            elif name == "FullSummary":
                result["summary"] = clean_html(text)
            elif name == "snippet":
                result["snippet"] = clean_html(text)
        results.append(result)
    return {
        "found": True,
        "topic": topic,
        "results": results,
    }

def select_best_result(topic: str, results: list[dict]) -> dict | None:
    if not results:
        return None
    topic_lower = topic.lower().strip()
    for result in results:

        title = result.get("title")

        if title and title.lower().strip() == topic_lower:
            return result
    for result in results:
        title = result.get("title")
        if (
            title
            and topic_lower in title.lower()
        ):
            return result
    return results[0]

def get_medical_knowledge(extracted_data: dict) -> list[dict]:
    tests = extracted_data.get("tests", [])
    if not tests:
        return []
    topic_map = {}
    for test in tests:
        test_name = test.get("test_name")
        medical_topic = test.get("medical_topic")
        if not test_name:
            continue
        if not medical_topic:
            continue
        if medical_topic not in topic_map:
            topic_map[medical_topic] = []
        topic_map[medical_topic].append(test_name)
    knowledge = []
    for topic, test_names in topic_map.items():
        try:
            search_result = fetch_medlineplus(topic)
        except requests.RequestException:
            knowledge.append({
                "topic": topic,
                "tests": test_names,
                "source": None,
                "found": False,
                "title": None,
                "url": None,
                "summary": None,
            })
            continue
        best_result = select_best_result(
            topic,
            search_result["results"]
        )
        if best_result is None:
            knowledge.append({
                "topic": topic,
                "tests": test_names,
                "source": "MedlinePlus",
                "found": False,
                "title": None,
                "url": None,
                "summary": None,
            })
            continue
        knowledge.append({
            "topic": topic,
            "tests": test_names,
            "source": "MedlinePlus",
            "found": True,
            "title": best_result["title"],
            "url": best_result["url"],
            "summary": best_result["summary"],
        })
    return knowledge