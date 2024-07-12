import axios from "axios";
import conn from "./src/db/index";

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string };
  location: { name: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

async function fetchCharacters(): Promise<Character[]> {
  let allCharacters: Character[] = [];
  let url = "https://rickandmortyapi.com/api/character";

  while (url) {
    const response = await axios.get(url);
    allCharacters = allCharacters.concat(response.data.results);
    url = response.data.info.next;
  }

  return allCharacters;
}

async function createTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS vakhos_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        status VARCHAR(50),
        species VARCHAR(50),
        type VARCHAR(50),
        gender VARCHAR(50),
        origin VARCHAR(100),
        location VARCHAR(100),
        image VARCHAR(255),
        episode TEXT[],
        url VARCHAR(255),
        created TIMESTAMP
    );
  `;
  await conn.query(createTableQuery);
}

async function insertCharacters(characters: Character[]): Promise<void> {
  const chunkSize = 100;
  const characterChunks = chunkArray(characters, chunkSize);

  for (let chunk of characterChunks) {
    const insertQuery = buildInsertQuery(chunk);
    const values = chunk.flatMap((char) => [
      char.name,
      char.status,
      char.species,
      char.type,
      char.gender,
      char.origin.name,
      char.location.name,
      char.image,
      char.episode,
      char.url,
      char.created,
    ]);
    try {
      await conn.query(insertQuery, values);
    } catch (err) {
      console.log(err);
    }
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size)
  );
}

function buildInsertQuery(characters: Character[]): string {
  const baseInsertQuery = `
    INSERT INTO vakhos_table (name, status, species, type, gender, origin, location, image, episode, url, created)
    VALUES 
  `;
  const values = characters
    .map(
      (_, index) =>
        `($${index * 11 + 1}, $${index * 11 + 2}, $${index * 11 + 3}, $${
          index * 11 + 4
        }, $${index * 11 + 5}, $${index * 11 + 6}, $${index * 11 + 7}, $${
          index * 11 + 8
        }, $${index * 11 + 9}, $${index * 11 + 10}, $${index * 11 + 11})`
    )
    .join(",");

  return baseInsertQuery + values;
}

async function main(): Promise<void> {
  try {
    await conn.connect();
    console.log("Connected to the database.");

    await createTable();
    console.log("Table created successfully.");

    const characters = await fetchCharacters();
    console.log(`Fetched ${characters.length} characters.`);

    await insertCharacters(characters);
    console.log("Characters inserted successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
    console.log("Connection closed.");
  }
}

main().catch(console.error);

export { fetchCharacters, createTable, insertCharacters };
