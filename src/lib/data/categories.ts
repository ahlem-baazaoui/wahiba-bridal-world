import { client } from "@/lib/client";

export interface Category {
  _id: string;
  name: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const query = `*[_type == "category"]{_id, name}`;
  return await client.fetch(query);
}
