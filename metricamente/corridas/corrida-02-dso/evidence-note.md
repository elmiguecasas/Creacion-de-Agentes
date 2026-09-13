# Nota sobre el índice de uso

El índice derivado usage.json incluye una fila tool_result con usageMetadata null dentro del listado Gemini: corresponde a la respuesta Tavily, no a una solicitud Gemini. Se conserva intacto el índice inicial. usage-by-provider.json separa correctamente los eventos por proveedor desde el mismo snapshot, sin alterar ningún output ni consumo recibido. Para consolidar tokens usar este segundo índice.
