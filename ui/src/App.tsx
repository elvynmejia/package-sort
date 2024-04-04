import "./App.css";
import { useState } from "react";
import { Input, Button, Alert, Loading } from "react-daisyui";
import axios from "axios";

type PackageAttributes = {
  length: number;
  width: number;
  height: number;
  mass: number;
};

const initialState = {
  length: 0,
  width: 0,
  height: 0,
  mass: 0
};

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | string>(false);
  const [sortOrder, setSortOrder] = useState(null);

  const [packageAttributes, setPackageAttributes]= useState<PackageAttributes>({
    ...initialState
  });

  const handlePackageAttributeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event?.target;
    
    setError("");

    if (value && (value as unknown as number) <= 0) {
      setError(`Invalid value. Value must be a number greater than 0. Field: ${name}. Value given: ${value}.`);
      event.target.value = "";
      return;
    }

    setPackageAttributes({
      ...packageAttributes,
      [name]: value
    });
  }

  const handleSort = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError(false);
    setSortOrder(null);
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/v1/packages/sort",
        {
          ...packageAttributes
        }
      );

      setSortOrder(response.data.sort_order);
    } catch (error: any) {
      setError(error.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError(false);
    setSortOrder(null);
    setPackageAttributes({ ...initialState });
  }

  return (
    <div className="flex justify-center flex-col items-center">
      <h1>Sort Your Package</h1>
      {error && <Alert status="error">{JSON.stringify(error)}</Alert>}
      {sortOrder && <Alert status="success" className="text-center">{sortOrder}</Alert>}
      {loading && <Loading />}
      <div className="flex justify-center flex-col space-y-5 mt-10">
        {Object.keys(packageAttributes).map((key: string) => {
          const value = packageAttributes[key as keyof PackageAttributes];
          return (
            <div key={key}>
              <p>{key}</p>
              <Input
                name={key}
                value={value}
                type="number"
                onChange={handlePackageAttributeChange}
              />
            </div>
          )
        })}

        <Button 
          size="sm"
          color="primary"
          onClick={handleSort}
        >
          Sort
        </Button>
        <Button 
          size="sm"
          onClick={handleReset}
        >
          Reset
        </Button>
        <pre>{JSON.stringify(packageAttributes, null, 2)}</pre>
      </div>
    </div>
  )
} 

export default App;
