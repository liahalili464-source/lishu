
const SIRV_API = "https://api.sirv.com/v2";
const ROOT = "/stills";
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

async function getToken() {
  const clientId = process.env.SIRV_CLIENT_ID;
  const clientSecret = process.env.SIRV_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Sirv environment variables");
  }

  const response = await fetch(`${SIRV_API}/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientId,
      clientSecret,
      expiresIn: 1200
    })
  });

  if (!response.ok) {
    throw new Error(`Sirv token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

async function readAll(dirname, token) {
  const contents = [];
  let continuation = "";

  do {
    const params = new URLSearchParams({ dirname });
    if (continuation) params.set("continuation", continuation);

    const response = await fetch(
      `${SIRV_API}/files/readdir?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Sirv readdir failed: ${response.status}`);
    }

    const data = await response.json();
    contents.push(...(data.contents || []));
    continuation = data.continuation || "";
  } while (continuation);

  return contents;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getToken();
    const rootItems = await readAll(ROOT, token);

    const folders = rootItems
      .filter(item => item.isDirectory)
      .filter(item => !item.filename.startsWith("_"));

    const categories = await Promise.all(
      folders.map(async folder => {
        const dirname = `${ROOT}/${folder.filename}`;
        const items = await readAll(dirname, token);

        const files = items
          .filter(item => !item.isDirectory)
          .filter(item => IMAGE_RE.test(item.filename))
          .filter(item => !item.filename.startsWith("_"))
          .sort((a, b) => new Date(b.mtime || 0) - new Date(a.mtime || 0));

        return {
          folder: folder.filename,
          path: dirname,
          files
        };
      })
    );

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      categories: categories.filter(category => category.files.length)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gallery unavailable" });
  }
}
