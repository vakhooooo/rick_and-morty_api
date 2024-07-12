import { fetchCharacters, createTable, insertCharacters } from "../../index";
import axios from "axios";
import { Client } from "pg";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("pg", () => {
	const mockQuery = jest.fn();
	return {
		Client: jest.fn(() => ({
			connect: jest.fn(),
			query: mockQuery.mockReturnValueOnce({
				rows: [
					{
						id: 1,
						name: "Rick Sanchez",
						status: "Alive",
						species: "Human",
						gender: "Male",
						location: { name: "Earth" },
						origin: { name: "Earth (C-137)" },
						image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
						episode: ["https://rickandmortyapi.com/api/episode/1"],
						url: "https://rickandmortyapi.com/api/character/1",
						created: "2017-11-04T18:48:46.250Z",
					},
				],
			}),
			end: jest.fn(),
		})),
	};
});
const mockedClient = new Client() as jest.Mocked<Client>;

interface Character {
	id: number;
	name: string;
	status: string;
	species: string;
	gender: string;
	location: { name: string };
	origin: { name: string };
	image: string;
	episode: string[];
	url: string;
	created: string;
}

describe("Rick and Morty API Integration Tests", () => {
	beforeAll(() => {
		mockedClient.query.mockReturnValueOnce();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	describe("Fetch Characters", () => {
		it("fetches characters successfully from API", async () => {
			const mockResponse = {
				data: {
					results: [
						{
							id: 1,
							name: "Rick Sanchez",
							status: "Alive",
							species: "Human",
							gender: "Male",
							location: { name: "Earth" },
							origin: { name: "Earth (C-137)" },
							image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
							episode: ["https://rickandmortyapi.com/api/episode/1"],
							url: "https://rickandmortyapi.com/api/character/1",
							created: "2017-11-04T18:48:46.250Z",
						},
					],
					info: { next: null },
				},
			};

			mockedAxios.get.mockResolvedValueOnce(mockResponse);

			const characters = await fetchCharacters();
			console.log('@@@@@@@@@@character', characters)
			expect(characters).toHaveLength(1);
			expect(characters[0].name).toBe("Rick Sanchez");
		});
	});

	describe("Create Table", () => {
		it("creates characters table in database", async () => {
			await createTable();
			expect(mockedClient.query).toHaveBeenCalled();
		});
	});

	describe("Insert Characters", () => {
		it("inserts characters into database", async () => {
			const characters = [
				{
					id: 1,
					name: "Rick Sanchez",
					status: "Alive",
					species: "Human",
					gender: "Male",
					location: { name: "Any" },
					origin: { name: "Unknown" },
					image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
					episode: [],
					url: "https://rickandmortyapi.com/api/character/1",
					created: "2017-11-04T18:48:46.250Z",
				},
				// ...
			];
	
			await insertCharacters(characters as any);
			expect(mockedClient.query).toHaveBeenCalled();
		});
	});
});
