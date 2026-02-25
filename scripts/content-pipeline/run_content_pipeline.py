"""
AI Klubben — Content/Resources Pipeline v3
High-quality educational articles about AI topics.
Pre-seeded authoritative URLs + trafilatura + Gemini 2.0 Flash.
February 2026 — comprehensive, up-to-date coverage.
"""
import time
from pipeline.config import load_existing_slugs, slug_exists
from pipeline.collect import extract_page
from pipeline.analyze import analyze_sources
from pipeline.write import write_content
from pipeline.verify import verify_content, handle_image, upsert_content


# ============================================================
# TOPICS — 6-8 diverse authoritative sources each
# NO Wikipedia. Use: arXiv, GitHub, HuggingFace, official docs,
# company blogs, universities, institutions, IBM, AWS, Google Cloud
# ============================================================

TOPICS = [
    # ═══════════ AI MODELS ═══════════
    {
        "name": "GPT-4o & GPT-4o mini",
        "urls": [
            ("https://www.ibm.com/think/topics/gpt-4o", "IBM GPT-4o"),
            ("https://www.ibm.com/think/topics/gpt-4", "IBM GPT-4"),
            ("https://aws.amazon.com/what-is/gpt/", "AWS GPT"),
            ("https://arxiv.org/abs/2303.08774", "arXiv GPT-4 Report"),
            ("https://huggingface.co/blog/gpt4o", "HuggingFace"),
            ("https://techcrunch.com/2023/03/14/openai-releases-gpt-4-ai-that-it-claims-is-state-of-the-art/", "TechCrunch GPT-4"),
            ("https://www.ibm.com/think/topics/gpt", "IBM GPT Overview"),
        ],
    },
    {
        "name": "OpenAI o1 & o3 (Reasoning Models)",
        "urls": [
            ("https://www.ibm.com/think/topics/openai-o1", "IBM o1"),
            ("https://techcrunch.com/2024/09/12/openai-unveils-a-model-that-can-fact-check-itself/", "TechCrunch o1"),
            ("https://techcrunch.com/2024/12/17/openai-brings-its-o1-reasoning-model-to-its-api-for-certain-developers/", "TechCrunch o1 API"),
            ("https://techcrunch.com/2024/12/22/openai-trained-o1-and-o3-to-think-about-its-safety-policy/", "TechCrunch o3 Safety"),
            ("https://huggingface.co/blog/open-r1", "HuggingFace Open-R1"),
            ("https://arxiv.org/abs/2501.12948", "arXiv DeepSeek-R1"),
            ("https://aws.amazon.com/what-is/gpt/", "AWS GPT"),
        ],
    },
    {
        "name": "Claude 3.5 Sonnet & Claude 4",
        "urls": [
            ("https://docs.anthropic.com/en/docs/about-claude/models", "Anthropic Docs"),
            ("https://www.ibm.com/think/topics/claude-ai", "IBM"),
            ("https://aws.amazon.com/bedrock/anthropic/", "AWS Bedrock Anthropic"),
            ("https://techcrunch.com/2025/02/25/claude-everything-you-need-to-know-about-anthropics-ai/", "TechCrunch Claude"),
            ("https://arxiv.org/abs/2407.01557", "arXiv Claude Governance"),
            ("https://huggingface.co/blog/rlhf", "HuggingFace RLHF"),
        ],
    },
    {
        "name": "Google Gemini 2.0",
        "urls": [
            ("https://blog.google/technology/google-deepmind/google-gemini-ai-update-december-2024/", "Google Blog"),
            ("https://deepmind.google/technologies/gemini/", "Google DeepMind"),
            ("https://arxiv.org/abs/2507.06261", "arXiv Gemini 2.5 Report"),
            ("https://blog.google/products/gemini/google-gemini-ai-collection-2024/", "Google Collection"),
            ("https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini", "Google Cloud"),
            ("https://www.ibm.com/think/topics/google-gemini", "IBM"),
        ],
    },
    {
        "name": "Meta Llama 3 & 4",
        "urls": [
            ("https://ai.meta.com/blog/meta-llama-3/", "Meta AI Blog"),
            ("https://ai.meta.com/research/publications/the-llama-3-herd-of-models/", "Meta Research"),
            ("https://arxiv.org/abs/2407.21783", "arXiv Llama 3 Paper"),
            ("https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md", "GitHub Model Card"),
            ("https://huggingface.co/blog/llama3", "HuggingFace Blog"),
            ("https://huggingface.co/meta-llama", "HuggingFace Meta"),
            ("https://www.ibm.com/think/topics/llama", "IBM"),
        ],
    },
    {
        "name": "Mistral AI Models",
        "urls": [
            ("https://mistral.ai/models", "Mistral AI Models"),
            ("https://mistral.ai/news/mistral-3", "Mistral AI News"),
            ("https://docs.mistral.ai/getting-started/models", "Mistral Docs"),
            ("https://docs.mistral.ai/", "Mistral Documentation"),
            ("https://huggingface.co/mistralai", "HuggingFace Mistral"),
            ("https://www.ibm.com/think/topics/mistral-ai", "IBM"),
        ],
    },
    {
        "name": "DeepSeek R1 & V3",
        "urls": [
            ("https://arxiv.org/abs/2501.12948", "arXiv DeepSeek-R1"),
            ("https://arxiv.org/abs/2412.19437", "arXiv DeepSeek-V3"),
            ("https://github.com/deepseek-ai/DeepSeek-R1", "GitHub R1"),
            ("https://github.com/deepseek-ai/DeepSeek-V3", "GitHub V3"),
            ("https://huggingface.co/deepseek-ai", "HuggingFace"),
            ("https://api-docs.deepseek.com/", "DeepSeek API Docs"),
            ("https://www.ibm.com/think/topics/deepseek", "IBM"),
        ],
    },

    # ═══════════ PLATFORMS / CHATBOTS ═══════════
    {
        "name": "ChatGPT",
        "urls": [
            ("https://www.ibm.com/think/topics/chatgpt", "IBM ChatGPT"),
            ("https://www.ibm.com/think/news/chatgpt-turns-2", "IBM ChatGPT History"),
            ("https://www.ibm.com/think/topics/gpt", "IBM GPT"),
            ("https://aws.amazon.com/what-is/gpt/", "AWS GPT"),
            ("https://arxiv.org/abs/2303.08774", "arXiv GPT-4 Report"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
            ("https://techcrunch.com/2023/03/14/openai-releases-gpt-4-ai-that-it-claims-is-state-of-the-art/", "TechCrunch"),
        ],
    },
    {
        "name": "Claude.ai",
        "urls": [
            ("https://docs.anthropic.com/en/docs/about-claude/models", "Anthropic Docs"),
            ("https://www.ibm.com/think/topics/claude-ai", "IBM"),
            ("https://aws.amazon.com/bedrock/anthropic/", "AWS Bedrock Anthropic"),
            ("https://techcrunch.com/2025/02/25/claude-everything-you-need-to-know-about-anthropics-ai/", "TechCrunch Claude"),
            ("https://arxiv.org/abs/2407.01557", "arXiv Claude Governance"),
            ("https://www.ibm.com/think/topics/constitutional-ai", "IBM Constitutional AI"),
        ],
    },
    {
        "name": "Perplexity AI",
        "urls": [
            ("https://www.ibm.com/think/topics/perplexity-ai", "IBM"),
            ("https://aws.amazon.com/what-is/retrieval-augmented-generation/", "AWS RAG"),
            ("https://cloud.google.com/use-cases/retrieval-augmented-generation", "Google Cloud RAG"),
            ("https://www.ibm.com/think/topics/retrieval-augmented-generation", "IBM RAG"),
            ("https://arxiv.org/abs/2005.11401", "arXiv RAG Paper"),
            ("https://www.ibm.com/think/topics/ai-search", "IBM AI Search"),
        ],
    },
    {
        "name": "Google Gemini App",
        "urls": [
            ("https://blog.google/products/gemini/google-gemini-update-august-2024/", "Google Blog"),
            ("https://blog.google/products/gemini/google-gemini-ai-collection-2024/", "Google Collection"),
            ("https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini", "Google Cloud"),
            ("https://deepmind.google/technologies/gemini/", "Google DeepMind"),
            ("https://www.ibm.com/think/topics/google-gemini", "IBM"),
            ("https://arxiv.org/abs/2507.06261", "arXiv Gemini Report"),
        ],
    },
    {
        "name": "Microsoft Copilot",
        "urls": [
            ("https://learn.microsoft.com/en-us/copilot/", "Microsoft Learn"),
            ("https://www.ibm.com/think/topics/microsoft-copilot", "IBM"),
            ("https://blogs.microsoft.com/blog/category/copilot/", "Microsoft Blog"),
            ("https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview", "MS 365 Copilot"),
            ("https://news.microsoft.com/source/features/ai/", "Microsoft News AI"),
            ("https://aws.amazon.com/what-is/gpt/", "AWS GPT"),
        ],
    },

    # ═══════════ IMAGE GENERATION ═══════════
    {
        "name": "Midjourney",
        "urls": [
            ("https://docs.midjourney.com/hc/en-us/articles/33329261836941-Getting-Started-Guide", "Midjourney Docs"),
            ("https://www.ibm.com/think/topics/midjourney", "IBM"),
            ("https://medium.com/@abiknewar2002/how-does-midjourney-work-its-mechanism-and-image-generation-94faea8240b3", "Medium"),
            ("https://huggingface.co/docs/diffusers/training/lora", "HuggingFace Diffusers"),
            ("https://stability.ai/news/stable-diffusion-3-research-paper", "Stability AI"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
        ],
    },
    {
        "name": "DALL-E 3",
        "urls": [
            ("https://www.ibm.com/think/topics/dall-e", "IBM"),
            ("https://cdn.openai.com/papers/dall-e-3.pdf", "DALL-E 3 Paper PDF"),
            ("https://arxiv.org/abs/2310.15144", "arXiv DEsignBench"),
            ("https://huggingface.co/docs/diffusers/training/lora", "HuggingFace Diffusers"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
        ],
    },
    {
        "name": "Stable Diffusion",
        "urls": [
            ("https://stability.ai/news/stable-diffusion-3-research-paper", "Stability AI Paper"),
            ("https://stability.ai/news/stable-diffusion-3", "Stability AI SD3"),
            ("https://huggingface.co/stabilityai/stable-diffusion-3-medium", "HuggingFace SD3"),
            ("https://huggingface.co/stabilityai/stable-diffusion-3.5-large", "HuggingFace SD3.5"),
            ("https://github.com/Stability-AI/stablediffusion", "GitHub"),
            ("https://huggingface.co/docs/diffusers/training/lora", "HuggingFace Diffusers"),
        ],
    },
    {
        "name": "Adobe Firefly",
        "urls": [
            ("https://www.adobe.com/products/firefly.html", "Adobe"),
            ("https://helpx.adobe.com/firefly/using/what-is-firefly.html", "Adobe Help"),
            ("https://blog.adobe.com/en/topics/adobe-firefly", "Adobe Blog"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://www.ibm.com/think/topics/ai-image-generation", "IBM Image Gen"),
        ],
    },

    # ═══════════ VIDEO GENERATION ═══════════
    {
        "name": "Sora (OpenAI)",
        "urls": [
            ("https://www.ibm.com/think/topics/sora-ai", "IBM Sora"),
            ("https://techcrunch.com/2024/02/15/openais-newest-model-can-generate-videos-and-they-look-decent/", "TechCrunch Sora"),
            ("https://arxiv.org/abs/2501.12948", "arXiv Reasoning Models"),
            ("https://www.ibm.com/think/topics/text-to-video", "IBM Text-to-Video"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
        ],
    },
    {
        "name": "Runway Gen-3",
        "urls": [
            ("https://runwayml.com/", "Runway"),
            ("https://runwayml.com/research/gen-3-alpha", "Runway Research"),
            ("https://www.ibm.com/think/topics/runway-ml", "IBM"),
            ("https://runwayml.com/research/", "Runway All Research"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
        ],
    },

    # ═══════════ CODING TOOLS ═══════════
    {
        "name": "GitHub Copilot",
        "urls": [
            ("https://github.com/features/copilot", "GitHub Features"),
            ("https://docs.github.com/en/copilot/get-started/features", "GitHub Docs Features"),
            ("https://docs.github.com/en/copilot/get-started/what-is-github-copilot", "GitHub Docs Overview"),
            ("https://github.blog/ai-and-ml/github-copilot/", "GitHub Blog AI"),
            ("https://docs.github.com/en/copilot", "GitHub Copilot Docs"),
            ("https://www.ibm.com/think/topics/github-copilot", "IBM"),
        ],
    },
    {
        "name": "Cursor",
        "urls": [
            ("https://docs.cursor.com/get-started/welcome", "Cursor Docs"),
            ("https://www.ibm.com/think/topics/cursor-ai", "IBM"),
            ("https://github.blog/ai-and-ml/github-copilot/", "GitHub Blog AI Coding"),
            ("https://www.ibm.com/think/topics/ai-code-generation", "IBM AI Code"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://cloud.google.com/discover/what-is-ai-code-generation", "Google Cloud"),
        ],
    },
    {
        "name": "Windsurf (Codeium)",
        "urls": [
            ("https://docs.windsurf.com/windsurf/getting-started", "Windsurf Docs"),
            ("https://www.ibm.com/think/topics/ai-code-generation", "IBM AI Code"),
            ("https://github.blog/ai-and-ml/github-copilot/", "GitHub Blog AI Coding"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://cloud.google.com/discover/what-is-ai-code-generation", "Google Cloud"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
        ],
    },

    # ═══════════ AI TECHNIQUES ═══════════
    {
        "name": "Prompt Engineering",
        "urls": [
            ("https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", "Anthropic Guide"),
            ("https://www.promptingguide.ai/", "Prompting Guide"),
            ("https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/", "Lil'Log"),
            ("https://cloud.google.com/discover/what-is-prompt-engineering", "Google Cloud"),
            ("https://www.ibm.com/think/topics/prompt-engineering", "IBM"),
            ("https://aws.amazon.com/what-is/prompt-engineering/", "AWS"),
        ],
    },
    {
        "name": "RAG (Retrieval-Augmented Generation)",
        "urls": [
            ("https://arxiv.org/abs/2005.11401", "arXiv Original RAG Paper"),
            ("https://arxiv.org/abs/2312.10997", "arXiv RAG Survey"),
            ("https://aws.amazon.com/what-is/retrieval-augmented-generation/", "AWS"),
            ("https://cloud.google.com/use-cases/retrieval-augmented-generation", "Google Cloud"),
            ("https://www.ibm.com/think/topics/retrieval-augmented-generation", "IBM"),
            ("https://docs.llamaindex.ai/en/stable/", "LlamaIndex Docs"),
        ],
    },
    {
        "name": "Fine-Tuning & LoRA",
        "urls": [
            ("https://arxiv.org/abs/2106.09685", "arXiv LoRA Paper"),
            ("https://huggingface.co/learn/llm-course/en/chapter11/4", "HuggingFace LoRA Course"),
            ("https://huggingface.co/docs/peft/main/en/index", "HuggingFace PEFT"),
            ("https://huggingface.co/docs/transformers/en/training", "HuggingFace Training"),
            ("https://arxiv.org/abs/2501.00365", "arXiv LoRA Review"),
            ("https://www.ibm.com/think/topics/fine-tuning", "IBM"),
        ],
    },
    {
        "name": "AI Agents & Agentic AI",
        "urls": [
            ("https://cloud.google.com/discover/what-are-ai-agents", "Google Cloud"),
            ("https://lilianweng.github.io/posts/2023-06-23-agent/", "Lil'Log"),
            ("https://www.ibm.com/think/topics/ai-agents", "IBM"),
            ("https://aws.amazon.com/what-is/ai-agents/", "AWS"),
            ("https://huggingface.co/blog/open-r1", "HuggingFace Agents"),
            ("https://arxiv.org/abs/2501.12948", "arXiv Reasoning"),
        ],
    },
    {
        "name": "Transformer Architecture",
        "urls": [
            ("https://arxiv.org/abs/1706.03762", "arXiv Attention Is All You Need"),
            ("https://jalammar.github.io/illustrated-transformer/", "Jay Alammar Illustrated"),
            ("https://huggingface.co/docs/transformers/en/index", "HuggingFace Transformers"),
            ("https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/", "Lil'Log"),
            ("https://www.ibm.com/think/topics/transformer-model", "IBM"),
            ("https://aws.amazon.com/what-is/transformers-in-artificial-intelligence/", "AWS"),
        ],
    },
    {
        "name": "MCP (Model Context Protocol)",
        "urls": [
            ("https://modelcontextprotocol.io/introduction", "MCP Official"),
            ("https://docs.anthropic.com/en/docs/agents-and-tools/mcp", "Anthropic Docs"),
            ("https://github.com/modelcontextprotocol/servers", "GitHub MCP Servers"),
            ("https://spec.modelcontextprotocol.io/", "MCP Specification"),
            ("https://github.com/modelcontextprotocol/specification", "GitHub MCP Spec"),
            ("https://www.ibm.com/think/topics/ai-agents", "IBM AI Agents"),
        ],
    },
    {
        "name": "RLHF & AI Alignment Training",
        "urls": [
            ("https://huggingface.co/blog/rlhf", "HuggingFace RLHF"),
            ("https://arxiv.org/abs/2504.12501", "arXiv RLHF Book"),
            ("https://arxiv.org/abs/2312.14925", "arXiv RLHF Survey"),
            ("https://arxiv.org/abs/2301.11270", "arXiv Principled RLHF"),
            ("https://www.ibm.com/think/topics/rlhf", "IBM"),
            ("https://aws.amazon.com/what-is/reinforcement-learning/", "AWS RL"),
        ],
    },
    {
        "name": "Quantization & Running LLMs Locally",
        "urls": [
            ("https://github.com/ggml-org/llama.cpp", "GitHub llama.cpp"),
            ("https://huggingface.co/docs/hub/en/gguf", "HuggingFace GGUF"),
            ("https://huggingface.co/docs/optimum/en/concept_guides/quantization", "HuggingFace Quantization"),
            ("https://ollama.com/blog/how-ollama-works", "Ollama Blog"),
            ("https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html", "ONNX Runtime"),
            ("https://www.ibm.com/think/topics/quantization", "IBM"),
        ],
    },

    # ═══════════ AI HARDWARE ═══════════
    {
        "name": "NVIDIA H100 & Blackwell GPUs",
        "urls": [
            ("https://www.nvidia.com/en-us/data-center/h100/", "NVIDIA H100"),
            ("https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/", "NVIDIA Blackwell"),
            ("https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/", "NVIDIA Developer Blog"),
            ("https://www.ibm.com/think/topics/nvidia-gpu", "IBM"),
            ("https://aws.amazon.com/ec2/instance-types/p5/", "AWS P5 Instances"),
            ("https://cloud.google.com/blog/products/ai-machine-learning/", "Google Cloud AI Blog"),
        ],
    },
    {
        "name": "Google TPU",
        "urls": [
            ("https://cloud.google.com/tpu/docs/intro-to-tpu", "Google Cloud TPU Intro"),
            ("https://cloud.google.com/tpu/docs/system-architecture-tpu-vm", "Google Cloud Architecture"),
            ("https://cloud.google.com/blog/products/ai-machine-learning/introducing-cloud-tpu-v5p-and-ai-hypercomputer", "Google Blog TPU v5"),
            ("https://deepmind.google/technologies/", "Google DeepMind Tech"),
            ("https://www.ibm.com/think/topics/tpu-vs-gpu", "IBM TPU vs GPU"),
            ("https://arxiv.org/abs/2507.06261", "arXiv Gemini Report"),
        ],
    },
    {
        "name": "Apple Intelligence & Neural Engine",
        "urls": [
            ("https://www.apple.com/apple-intelligence/", "Apple Intelligence"),
            ("https://machinelearning.apple.com/research/introducing-apple-foundation-models", "Apple ML Research"),
            ("https://developer.apple.com/machine-learning/", "Apple Developer ML"),
            ("https://machinelearning.apple.com/", "Apple ML"),
            ("https://www.ibm.com/think/topics/apple-intelligence", "IBM"),
            ("https://aws.amazon.com/what-is/foundation-models/", "AWS Foundation Models"),
        ],
    },

    # ═══════════ AI COMPANIES ═══════════
    {
        "name": "OpenAI",
        "urls": [
            ("https://www.ibm.com/think/topics/openai", "IBM OpenAI"),
            ("https://www.ibm.com/think/topics/chatgpt", "IBM ChatGPT"),
            ("https://www.ibm.com/think/news/chatgpt-turns-2", "IBM ChatGPT History"),
            ("https://arxiv.org/abs/2303.08774", "arXiv GPT-4 Report"),
            ("https://techcrunch.com/2023/03/14/openai-releases-gpt-4-ai-that-it-claims-is-state-of-the-art/", "TechCrunch GPT-4"),
            ("https://github.com/openai/openai-python", "GitHub OpenAI SDK"),
        ],
    },
    {
        "name": "Anthropic",
        "urls": [
            ("https://docs.anthropic.com/en/docs/about-claude/models", "Anthropic Models Docs"),
            ("https://www.ibm.com/think/topics/anthropic", "IBM"),
            ("https://aws.amazon.com/bedrock/anthropic/", "AWS Bedrock Anthropic"),
            ("https://techcrunch.com/2025/02/25/claude-everything-you-need-to-know-about-anthropics-ai/", "TechCrunch Claude"),
            ("https://arxiv.org/abs/2407.01557", "arXiv Claude Governance"),
            ("https://www.ibm.com/think/topics/claude-ai", "IBM Claude"),
        ],
    },
    {
        "name": "Google DeepMind",
        "urls": [
            ("https://deepmind.google/about/", "DeepMind About"),
            ("https://deepmind.google/research/", "DeepMind Research"),
            ("https://deepmind.google/technologies/", "DeepMind Technologies"),
            ("https://deepmind.google/blog/taking-a-responsible-path-to-agi/", "DeepMind AGI Blog"),
            ("https://blog.google/technology/google-deepmind/", "Google Blog DeepMind"),
            ("https://www.ibm.com/think/topics/google-deepmind", "IBM"),
        ],
    },
    {
        "name": "xAI & Grok",
        "urls": [
            ("https://github.com/xai-org/grok-1", "GitHub Grok-1"),
            ("https://www.ibm.com/think/topics/grok-ai", "IBM"),
            ("https://huggingface.co/xai-org", "HuggingFace xAI"),
            ("https://aws.amazon.com/what-is/large-language-model/", "AWS LLM Overview"),
            ("https://www.ibm.com/think/topics/large-language-models", "IBM LLMs"),
            ("https://docs.x.ai/docs/overview", "xAI API Docs"),
        ],
    },

    # ═══════════ AI CONCEPTS ═══════════
    {
        "name": "AGI (Artificial General Intelligence)",
        "urls": [
            ("https://deepmind.google/blog/taking-a-responsible-path-to-agi/", "DeepMind AGI"),
            ("https://arxiv.org/abs/2503.23923", "arXiv What is AGI"),
            ("https://www.ibm.com/think/topics/artificial-general-intelligence", "IBM"),
            ("https://80000hours.org/topic/priority-paths/technical-ai-safety/", "80,000 Hours"),
            ("https://www.ibm.com/think/topics/ai-safety", "IBM Safety"),
            ("https://arxiv.org/abs/2304.12479", "arXiv AGI Education"),
        ],
    },
    {
        "name": "AI Safety & Alignment",
        "urls": [
            ("https://www.alignmentforum.org/posts/5rsa37pBjo4Cf9fkE/a-newcomer-s-guide-to-the-technical-ai-safety-field", "Alignment Forum"),
            ("https://80000hours.org/topic/priority-paths/technical-ai-safety/", "80,000 Hours"),
            ("https://www.ibm.com/think/topics/ai-safety", "IBM"),
            ("https://arxiv.org/abs/2312.14925", "arXiv RLHF Survey"),
            ("https://huggingface.co/blog/rlhf", "HuggingFace RLHF"),
            ("https://www.ibm.com/think/topics/ai-ethics", "IBM AI Ethics"),
        ],
    },
    {
        "name": "EU AI Act",
        "urls": [
            ("https://artificialintelligenceact.eu/", "EU AI Act Portal"),
            ("https://artificialintelligenceact.eu/high-level-summary/", "EU AI Act Summary"),
            ("https://artificialintelligenceact.eu/the-act/", "EU AI Act Full Text"),
            ("https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", "EU Commission"),
            ("https://www.ibm.com/think/topics/eu-ai-act", "IBM"),
            ("https://www.brookings.edu/articles/the-eu-ai-act-explained/", "Brookings"),
        ],
    },
    {
        "name": "AI & Copyright",
        "urls": [
            ("https://www.copyright.gov/ai/", "US Copyright Office"),
            ("https://www.wipo.int/about-ip/en/artificial_intelligence/", "WIPO"),
            ("https://www.brookings.edu/articles/ai-and-the-visual-arts-the-case-for-copyright-protection/", "Brookings"),
            ("https://arxiv.org/abs/2502.15858", "arXiv AI Copyright"),
            ("https://www.ibm.com/think/topics/ai-copyright", "IBM"),
            ("https://www.ibm.com/think/topics/ai-ethics", "IBM AI Ethics"),
        ],
    },
    {
        "name": "Deepfakes & AI Media",
        "urls": [
            ("https://www.ibm.com/think/topics/deepfake", "IBM"),
            ("https://www.brookings.edu/articles/how-to-address-the-harms-of-deepfakes/", "Brookings"),
            ("https://www.ibm.com/think/topics/ai-ethics", "IBM AI Ethics"),
            ("https://aws.amazon.com/what-is/generative-ai/", "AWS Generative AI"),
            ("https://cloud.google.com/discover/what-is-generative-ai", "Google Cloud GenAI"),
            ("https://www.ibm.com/think/topics/generative-ai", "IBM Generative AI"),
        ],
    },

    # ═══════════ DEVELOPER TOOLS ═══════════
    {
        "name": "Hugging Face",
        "urls": [
            ("https://huggingface.co/docs", "HuggingFace Docs"),
            ("https://huggingface.co/docs/hub/index", "HuggingFace Hub Docs"),
            ("https://huggingface.co/docs/transformers/en/index", "HuggingFace Transformers"),
            ("https://huggingface.co/huggingface", "HuggingFace Org"),
            ("https://github.com/huggingface/transformers", "GitHub Transformers"),
            ("https://www.ibm.com/think/topics/hugging-face", "IBM"),
        ],
    },
    {
        "name": "LangChain",
        "urls": [
            ("https://www.langchain.com/", "LangChain"),
            ("https://python.langchain.com/docs/get_started/introduction", "LangChain Docs"),
            ("https://www.ibm.com/think/topics/langchain", "IBM"),
            ("https://blog.langchain.dev/", "LangChain Blog"),
            ("https://github.com/langchain-ai/langchain", "GitHub LangChain"),
            ("https://docs.smith.langchain.com/", "LangSmith Docs"),
        ],
    },
    {
        "name": "Ollama",
        "urls": [
            ("https://github.com/ollama/ollama", "GitHub Ollama"),
            ("https://ollama.com/blog", "Ollama Blog"),
            ("https://ollama.com/blog/how-ollama-works", "Ollama How It Works"),
            ("https://www.ibm.com/think/topics/ollama", "IBM"),
            ("https://ollama.com/library", "Ollama Model Library"),
            ("https://huggingface.co/docs/hub/en/gguf", "HuggingFace GGUF"),
        ],
    },

    # ═══════════ INDUSTRY ═══════════
    {
        "name": "AI in Healthcare",
        "urls": [
            ("https://www.ibm.com/think/topics/artificial-intelligence-medicine", "IBM"),
            ("https://aws.amazon.com/what-is/ai-in-healthcare/", "AWS"),
            ("https://cloud.google.com/discover/what-is-ai-in-healthcare", "Google Cloud"),
            ("https://hai.stanford.edu/news/ai-will-transform-teaching-and-learning-lets-get-it-right", "Stanford HAI"),
            ("https://www.who.int/news-room/fact-sheets/detail/artificial-intelligence-in-health", "WHO"),
            ("https://www.ibm.com/think/topics/ai-in-healthcare", "IBM Healthcare"),
        ],
    },
    {
        "name": "AI in Education",
        "urls": [
            ("https://www.ibm.com/think/topics/ai-in-education", "IBM"),
            ("https://hai.stanford.edu/news/ai-will-transform-teaching-and-learning-lets-get-it-right", "Stanford HAI"),
            ("https://cloud.google.com/discover/what-is-ai-in-education", "Google Cloud"),
            ("https://arxiv.org/abs/2304.12479", "arXiv AI Education"),
            ("https://arxiv.org/abs/2412.16429", "arXiv LearnLM"),
            ("https://www.oecd.org/en/topics/artificial-intelligence.html", "OECD AI"),
        ],
    },
]


def process_topic(topic: dict) -> bool:
    """Full pipeline for one content topic using pre-seeded URLs."""
    name = topic["name"]
    urls = topic["urls"]

    print(f"\n  {'─'*50}")
    print(f"  📚 {name}")
    print(f"  {'─'*50}")

    # Step 1: COLLECT from pre-seeded URLs
    print(f"  [STEP 1: COLLECT]")
    collected: list = []
    for url, source_name in urls:
        page = extract_page(url, source_name)
        if page and len(page.body) > 300:
            collected.append(page)
            chars = len(page.body)
            print(f"    ✓ {page.source_name}: {chars:,} chars — {page.title[:55]}...")
        else:
            print(f"    ✗ {source_name}: could not extract")
        time.sleep(0.5)

    if len(collected) < 1:
        print(f"    ✗ No sources extracted")
        return False

    total_chars = sum(len(p.body) for p in collected)
    print(f"    📊 {len(collected)} sources, {total_chars:,} total chars")

    # Step 2: ANALYZE
    print(f"  [STEP 2: ANALYZE]")
    analysis = analyze_sources(name, collected)
    if not analysis:
        print(f"    ✗ Analysis failed")
        return False

    if not analysis.is_suitable:
        print(f"    ⏭ Not suitable: score={analysis.quality_score}/10")
        return False

    print(f"    ✓ {analysis.category}/{analysis.subcategory} "
          f"score={analysis.quality_score}/10 facts={len(analysis.key_facts)}")

    # Step 3: WRITE
    print(f"  [STEP 3: WRITE]")
    article = write_content(name, analysis, collected)
    if not article:
        print(f"    ✗ Write failed")
        return False

    sv_words = len(article.content_sv.split())
    en_words = len(article.content_en.split())
    print(f"    ✓ {article.title_sv[:55]}...")
    print(f"    � SV: {sv_words} words, EN: {en_words} words")

    # Quality gate: reject if too short
    if sv_words < 400 or en_words < 400:
        print(f"    ⚠ Content too short ({sv_words}/{en_words} words), skipping")
        return False

    # Step 4: VERIFY & PUBLISH
    print(f"  [STEP 4: VERIFY]")
    issues = verify_content(article)
    if issues:
        print(f"    ⚠ Issues: {', '.join(issues)}")

    # Handle image (only for new articles or if no image exists)
    image_url = None
    if not slug_exists(article.slug):
        for src in collected:
            if src.og_image:
                image_url = handle_image(src, article.slug)
                if image_url:
                    print(f"    ✓ Image uploaded")
                    break

    result = upsert_content(article, analysis, image_url)
    if result == "updated":
        print(f"    🔄 Updated: {article.slug} (with references)")
        return True
    elif result == "inserted":
        print(f"    ✅ Published: {article.slug}")
        return True
    return False


def main():
    print("=" * 60)
    print("  AI KLUBBEN — Content Pipeline v3")
    print("  February 2026 • Comprehensive AI Knowledge Base")
    print("  Gemini 2.0 Flash + trafilatura")
    print("=" * 60)

    load_existing_slugs()

    created = 0
    updated = 0
    skipped = 0

    for i, topic in enumerate(TOPICS, 1):
        print(f"\n{'='*60}")
        print(f"  [{i}/{len(TOPICS)}] {topic['name']}")
        print(f"{'='*60}")

        success = process_topic(topic)
        if success:
            created += 1
        else:
            skipped += 1

        time.sleep(3)

    print(f"\n{'='*60}")
    print(f"  ✅ DONE — {created} processed, {skipped} skipped (of {len(TOPICS)})")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
