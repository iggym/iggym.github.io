"""Build the confirmed 2-page public résumé.

Source layout matches the résumé Iggy confirmed in November 2026.
Public copies omit phone and email. Contact is LinkedIn, X, the site, and GitHub.

Usage: python3 resume/build_2page.py [out.docx]
"""
import os
import sys
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUT = os.path.join(HERE, "..", "assets", "resume", "iggy-resume-2page.docx")

d = Document()
for s in d.sections:
    s.top_margin = s.bottom_margin = Inches(0.55)
    s.left_margin = s.right_margin = Inches(0.65)
st = d.styles["Normal"]
st.font.name = "Calibri"
st.font.size = Pt(10)
st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
st.paragraph_format.space_after = Pt(0)
st.paragraph_format.space_before = Pt(0)
st.paragraph_format.line_spacing = 1.0


def para(text="", bold=False, size=None, align=None, after=0, before=0, italic=False):
    p = d.add_paragraph()
    if text:
        r = p.add_run(text)
        r.bold = bold
        r.italic = italic
        if size:
            r.font.size = Pt(size)
    if align:
        p.alignment = align
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.space_before = Pt(before)
    return p


def rule(p):
    pPr = p._p.get_or_add_pPr()
    b = OxmlElement("w:pBdr")
    bt = OxmlElement("w:bottom")
    for k, v in (("val", "single"), ("sz", "6"), ("space", "1"), ("color", "444444")):
        bt.set(qn("w:" + k), v)
    b.append(bt)
    pPr.append(b)


def heading(t):
    p = para(t.upper(), bold=True, size=11, before=6, after=2)
    rule(p)


def labeled(label, text):
    p = para()
    r = p.add_run(label + ": ")
    r.bold = True
    p.add_run(text)
    p.paragraph_format.space_after = Pt(1)


def bullet(t):
    p = d.add_paragraph(style="List Bullet")
    p.add_run(t)
    pf = p.paragraph_format
    pf.space_after = Pt(1)
    pf.left_indent = Inches(0.22)
    pf.first_line_indent = Inches(-0.16)


def job(title, org, dates, loc=None, note=None):
    p = para(before=4)
    r = p.add_run(f"{title} | {org}")
    r.bold = True
    p.add_run(f" | {dates}" + (f" | {loc}" if loc else ""))
    if note:
        para(note, italic=True)


para("IGGY MWANGI", bold=True, size=18, align=WD_ALIGN_PARAGRAPH.CENTER)
para(
    "Dallas, TX | linkedin.com/in/iggym | x.com/iggym | iggym.github.io | github.com/iggym",
    align=WD_ALIGN_PARAGRAPH.CENTER,
    size=9.5,
)
para(
    "Principal AI Systems Architect | AI Platform, Agent Infrastructure & LLM Inference",
    bold=True,
    size=11.5,
    align=WD_ALIGN_PARAGRAPH.CENTER,
    before=4,
    after=2,
)

heading("Professional Summary")
para(
    "AI platform and agent-infrastructure architect with 25+ years shipping production software "
    "(Apple, Sam's Club, AT&T, Contran) and recent hands-on work building LLM inference, retrieval, "
    "agent orchestration, evaluation, and observability for enterprise workloads. I make AI systems "
    "dependable by engineering the harness around the model (context, checks, deterministic workflows), "
    "an approach I call Compound Engineering. Recent results: 38% fewer hallucinations from RAG "
    "re-architecture, 42% more reliable multi-tool agent routing, 27% lower LLM spend via cost-aware "
    "model routing, and 70% less debugging time from OpenTelemetry reasoning traces. Author of "
    "open-source agent-reliability tools (deterministic agent supervision, pre-merge policy gates for "
    "agent code changes, context trimming, AI bill of materials). Hands-on, customer-facing, and "
    "comfortable turning ambiguous problems into platforms other teams build on. U.S. citizen.",
    after=1,
)

heading("Core Skills")
labeled(
    "LLM Inference & Serving",
    "vLLM, Ray Serve, KServe, Triton, TensorRT-LLM, EKS GPU autoscaling, Flash-Attention 3, edge inference (Jetson Orin, ONNX Runtime Mobile, Ollama)",
)
labeled(
    "Agents & Orchestration",
    "LangGraph, CrewAI, AutoGen 2.0, OpenAI Swarm, multi-tool routing, state-transition tool design, deterministic/idempotent tools",
)
labeled("Retrieval & RAG", "Weaviate, Milvus, pgvector, FAISS, RAG optimization, vector hygiene, CLIP embeddings")
labeled(
    "Evaluation & Safety",
    "Ragas, DeepEval, DSPy, structured test harnesses, prompt-format drift detection, policy guardrails",
)
labeled(
    "Models & Fine-Tuning",
    "GPT-4.1, Claude 3.5 Sonnet, Gemini 2.0 Flash, Mistral Large 2, Llama 3.3, Gemma 3.1, LoRA/QLoRA, cost-aware model routing",
)
labeled(
    "MLOps & Observability",
    "Kubeflow, MLflow, SageMaker Pipelines, Argo Workflows, model lineage, drift dashboards, OpenTelemetry, Splunk",
)
labeled(
    "Cloud & Infrastructure",
    "AWS, Azure, GCP, Kubernetes/EKS, Docker, Terraform, Pulumi, CloudFormation, CDK, Cloudflare Workers/Pages, FinOps, Sysdig, Tenable",
)
labeled("Languages", "Python, Go, TypeScript/JavaScript, C#, Java, Swift, Objective-C, SQL, gRPC, REST")

heading("Professional Experience")
job(
    "Senior Solutions Architect, AI & Cloud Infrastructure",
    "VynixAI",
    "Jan 2025 - Present",
    "Dallas, TX",
    "AI-driven, cloud-native, and edge-optimized platforms for real-time retail and enterprise workloads: LLM systems, scalable inference, agent automation.",
)
for b in [
    "Re-architected the RAG pipeline on Weaviate, Milvus, and pgvector; tightening vector hygiene cut hallucinations 38% and beat model upgrades on cost and impact.",
    "Built multi-tool agent routing with LangGraph, CrewAI, AutoGen 2.0, and OpenAI Swarm; modeling tools as state transitions made routing 42% more reliable.",
    "Designed cost-aware hybrid LLM routing across GPT-4.1 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash, and Mistral Large 2, reducing spend 27% without quality loss.",
    "Introduced reasoning-trace observability with OpenTelemetry model-level spans, exposing bottlenecks logs never surfaced and cutting debugging time 70%.",
    "Built an evaluation harness (Ragas, DeepEval, DSPy, structured test sets) that caught prompt-format drift before production and cut iteration cycles in half.",
    "Upgraded fine-tuning to Llama 3.3 with LoRA/QLoRA and Flash-Attention 3, with stable inference on EKS GPU autoscaling; added edge inference (TensorRT-LLM on Jetson Orin, Ollama, ONNX Runtime Mobile) for predictable retail latency.",
]:
    bullet(b)

job("Cloud Architect and Machine Learning Engineer", "Nubla AI", "Jan 2024 - Dec 2024", "Austin, TX")
for b in [
    "Reduced LLM latency 22% by reworking tokenization and preprocessing paths, the hidden bottleneck rather than inference.",
    "Reorganized training data across S3, BigQuery, and ADLS; reducing data gravity cut training time 35%.",
    "Refactored agent tools into deterministic, idempotent functions for AutoGen 2.0 and CrewAI, improving pipeline predictability more than any model upgrade.",
    "Built a synchronized RAG evaluation loop (Ragas, DeepEval) and added model lineage and feature-drift monitoring that prevented two production incidents.",
    "Tuned Gemma 3.1 for production, outperforming larger models once retrieval was aligned; standardized multimodal preprocessing with OpenCV and CLIP.",
]:
    bullet(b)

job(
    "Cloud Architect and Engineer",
    "Apple",
    "Jan 2022 - Dec 2023",
    "Cupertino, CA",
    "Cloud modernization for Project Titan across AWS, internal Apple cloud platforms, Kubernetes, and distributed systems.",
)
for b in [
    "Led FinOps cost optimization (rightsizing, autoscaling, reserved capacity), reducing cloud spend 30%+ year over year.",
    "Shifted pipelines to event-driven designs (Lambda, SQS, SNS, Step Functions), reducing compute cost about 30% by removing idle waits.",
    "Migrated on-prem systems to AWS and internal platforms, replacing lift-and-shift workloads with serverless and containerized designs.",
    "Rebuilt Terraform and Pulumi modules as versioned, testable components, eliminating configuration drift; added OpenTelemetry tracing across services.",
    "Hardened container images and DevSecOps pipelines with Sysdig and Tenable using minimal base images, sharply reducing vulnerabilities.",
]:
    bullet(b)

job(
    "Principal Software Engineer, Cloud and Machine Learning",
    "Sam's Club",
    "Oct 2017 - Dec 2021",
    "Dallas-Fort Worth, TX",
)
for b in [
    "Architected cloud ML forecasting, computer vision, and real-time analytics solutions at national retail scale (Python, PyTorch, Azure).",
    "Owned the end-to-end MLOps lifecycle (data checks, deployment, monitoring, lifecycle management) and guided teams moving models from notebooks to production.",
    "Automated upstream data-quality and drift monitoring pipelines; built cross-platform mobile apps (React Native, Xamarin, iOS, Android) for supply chain and inventory.",
]:
    bullet(b)

job(
    "Hybrid Cloud Architect and Developer (Side Project)",
    "FL Global",
    "Jan 2018 - Apr 2019",
    "Dallas-Fort Worth, TX",
)
bullet(
    "Side project alongside Sam's Club: built media enrichment, streaming, and serverless telemetry pipelines on AWS (Kinesis, Lambda, API Gateway, DynamoDB) and Azure (Event Hub, Kafka on HDInsight, Data Explorer, Synapse), with Terraform, CloudFormation, CDK, and ARM for multi-cloud parity."
)

job(
    "Mobile, Web, Infrastructure and System Architect",
    "Contran Corp",
    "Jun 2011 - Oct 2017",
    "Dallas-Fort Worth, TX",
)
bullet(
    "Built API and integration infrastructure with Go, gRPC, Kubernetes, Docker, and Swagger; Splunk monitoring; monitoring and disaster-recovery cloud services (Node.js, Go, MongoDB); native iOS and Android apps."
)

p = para(before=4)
r = p.add_run("Earlier Roles (1998 - 2011): ")
r.bold = True
p.add_run(
    "AT&T, Mobile & Web Applications Architect Lead (built a five-person team; support tooling for the iPhone 3G launch; AT&T Developer Resource Toolkit) | Ackerman McQueen, Team Architect (led five-person teams; iOS/Android apps for NRA, Oklahoma Tourism, Chickasaw Nation) | ACS, Team Lead (11-person team; 7-Eleven, McDonald's, City of Dallas, NTTA) | Verizon, SOA/ESB Architect (contract) | GuideStone, Trillium, EDS, ADP, IBM, Cingular, and others."
)

heading("Compound Engineering - Projects (open source and public sites)")
para(
    "Personal approach to AI reliability: invest in the harness (context, checks, fixed workflows) rather than waiting for a better model. Not a company or a job. All public at github.com/iggym and iggym.github.io.",
    italic=True,
    after=1,
)
for name, txt in [
    (
        "Deterministic Agent Supervisor",
        "(Python, Rust): decouples Python-based LLM reasoning from an immutable compiled Rust state machine that rejects unauthorized execution transitions, preventing LLM-induced infrastructure errors.",
    ),
    (
        "Factory Gate",
        "(JavaScript): structural policy guardrails that verify safe agent state transitions on an agent's code changes before they reach the target branch.",
    ),
    (
        "Sliding Window Trim Engine",
        "(Go): high-throughput pre-tokenization utility that prunes redundant chat-history blocks to cut context overhead before model calls.",
    ),
    (
        "aiboom",
        "(Python): generates an audit-ready AI Bill of Materials from a repository in one command; companion tools SurfaceLock (lockfile for prompts, models, and settings) and modelbump (behavioral diff for model upgrades).",
    ),
    (
        "circuit-x",
        ": research exposing internal feature circuit paths inside code LLMs.",
    ),
    (
        "Where Is The Compute",
        "(where-is-the-compute.pages.dev): sourced tracker of AI compute by lab, with uncertainty ranges from Epoch AI data.",
    ),
    (
        "Which Agent",
        "(which-agent.pages.dev): independent guide comparing 10 AI agents, with 97 sourced claims and cost, security, and agent-picker tools.",
    ),
    (
        "Browser tools and field guides",
        ": 11 in-browser AI tools on iggym.github.io (Prompt Matrix Evaluator, Eval Set Builder, Agent Stateboard, Rate Limit Planner, and more) and 17 content sites including Production AI Patterns, The AI Runbook, and FDE Field Notes.",
    ),
]:
    p = d.add_paragraph(style="List Bullet")
    r = p.add_run(name)
    r.bold = True
    p.add_run(" " + txt if txt[0] == "(" else txt)
    pf = p.paragraph_format
    pf.space_after = Pt(1)
    pf.left_indent = Inches(0.22)
    pf.first_line_indent = Inches(-0.16)

heading("Education")
para("B.Sc. Computer Science, University of Minnesota | 1996 - 2001")

d.core_properties.title = "Iggy Mwangi résumé"
d.core_properties.author = "Iggy Mwangi"
d.core_properties.comments = ""
d.core_properties.subject = "AI platform and agent infrastructure"

out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
d.save(out)
print("wrote", out)
