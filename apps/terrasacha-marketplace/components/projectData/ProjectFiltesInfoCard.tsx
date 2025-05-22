import Link from 'next/link';
import FormGroup from '../common/FormGroup';
import { Button, Table } from 'flowbite-react';
import { convertAWSDatetimeToDate } from '@terrasacha/lib/util';

export default function ProjectFilesInfoCard({ projectFiles }: any) {
  return (
    <div className="w-full h-fit p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flow-root">
        {projectFiles.length > 0 ? (
          <Table className="text-center">
            <Table.Head>
              <Table.HeadCell>Nombre</Table.HeadCell>
              <Table.HeadCell>Ultima actualización</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {projectFiles.map((file: any) => {
                let urlFileDecoded = decodeURIComponent(file.fileURLS3).split('/')
                urlFileDecoded.splice(5,0,"public")
                let urlFile = urlFileDecoded.join("/")
                return (
                  <Table.Row key={file.id}>
                    <Table.Cell>{file.docTitle}</Table.Cell>
                    <Table.Cell>
                      {convertAWSDatetimeToDate(file.createdAt)}
                    </Table.Cell>
                    <Table.Cell className="flex justify-center">
                      <Link href={urlFile} target="_blank">
                        <Button className="m-1" size="sm">
                          Descargar
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        ) : (
          <div className="text-center">Aún no se han subido documentos.</div>
        )}
      </div>
    </div>
  );
}
