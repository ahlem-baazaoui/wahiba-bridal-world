import { client } from "@/lib/client";

// Update this interface to reflect what you're actually fetching for Images
interface Image {
  _id: string; // The _id of the asset itself
  _key: string;
  _type: "image";
  // name: string; // This usually isn't on the image asset directly, but rather on the parent object.
  // imageUrl?: string; // This should be generated using urlFor, not stored directly
  asset: {
    _ref: string; // This is the reference to the actual image asset document
    _type: "reference";
  };
}

export interface Color {
  _key: string;
  name: string;
  images: Image[];
}

// Add an interface for the dereferenced Category
export interface DereferencedCategory {
  _id: string;
  _ref: string; // Reference to the category document
  name: string;
  // Add other category fields if you project them in the GROQ query and need them
}

export interface Dress {
  _id: string;
  name: string;
  description: string;
  newCollection: boolean;
  pricePerDay: number;
  isRentOnDiscount?: boolean;
  newPricePerDay?: number;
  isForSale: boolean;
  buyPrice?: number;
  isSellOnDiscount?: boolean;
  newBuyPrice?: number;
  colors: Color[];
  sizes: string[];
  // IMPORTANT: Add the categories field, as dereferenced objects
  categories?: DereferencedCategory[];
}

export async function fetchDresses(): Promise<Dress[]> {
  const query = `
    *[_type == "dress"] {
      _id,
      name,
      description,
      newCollection,
      pricePerDay,
      isRentOnDiscount,
      newPricePerDay,
      isForSale,
      buyPrice,
      isSellOnDiscount,
      newBuyPrice,
      colors[]{
        _key,
        name,
        images[]{
          _key,
          _type,
          asset->{
            _id,
            url // Fetch the URL directly from the asset
          }
        }
      },
      sizes,
      // Dereference categories to get their _id and name
      categories[]->{
        _id,
        name
      }
    }
  `;
  const data = await client.fetch(query, { _ts: Date.now() });

  // No explicit mapping needed if your GROQ query projects the fields correctly
  // Just ensure the fetched data matches the Dress interface.
  return data as Dress[]; // Cast directly if the query aligns with the interface
}

// Export as a Promise (though generally, directly calling fetchDresses in useEffect is common)
export const dresses: Promise<Dress[]> = fetchDresses();

export async function fetchDressById(id: string): Promise<Dress | null> {
  // IMPORTANT: Use parameter binding for security and correctness
  // Also, dereference categories here as well
  const query = `
    *[_type == "dress" && _id == $id][0] {
      _id,
      name,
      description,
      pricePerDay,
      isRentOnDiscount,
      newPricePerDay,
      isForSale,
      buyPrice,
      isSellOnDiscount,
      newBuyPrice,
      colors[]{
        _key,
        name,
        images[]{
          _key,
          _type,
          asset->{
            _id,
            url
          }
        }
      },
      sizes,
      categories[]->{
        _id,
        name
      }
    }
  `;
  // Pass the id as a parameter object
  const data = await client.fetch(query, { id });
  // Directly return data if it matches the interface
  return data ? (data as Dress) : null;
}

export async function updateDress(id: string, values: Partial<Dress>) {
  return client.patch(id).set(values).commit();
}

export async function deleteDress(id: string) {
  return client.delete(id);
}